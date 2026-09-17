import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as rax from "retry-axios";
import type { AxiosRequestConfig } from "axios";

@Injectable()
export class ExternalApiClient {
  constructor(private readonly http: HttpService) {
    rax.attach(this.http.axiosRef as any);
    (this.http.axiosRef.defaults as any).raxConfig = {
      instance: this.http.axiosRef,
      retry: 3,
      noResponseRetries: 2,
      backoffType: "exponential",
    };
    this.http.axiosRef.defaults.timeout = 10_000;
  }

  async post<T = any>(url: string, data: any, config?: AxiosRequestConfig<T>) {
    const res = await this.http.axiosRef.post<T>(url, data, config);
    return res.data;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.axiosRef.get<T>(url, config);
    return res.data;
  }
}
