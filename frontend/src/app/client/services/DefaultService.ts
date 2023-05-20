/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunGetCategoriesRequest } from '../models/RunGetCategoriesRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Get Health
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHealthHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }

    /**
     * Post Run Get Categories
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static postRunGetCategoriesRunGetCategoriesPost(
        requestBody: RunGetCategoriesRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/run/get_categories',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
