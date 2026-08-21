import http from 'k6/http';
import { check } from 'k6';

const BASE_URL =
    'http://smartretailx-alb-620890940.ap-southeast-1.elb.amazonaws.com';

export const options = {
    vus: 1,
    iterations: 30,

    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<2000']
    }
};

export default function () {

    const response = http.get(`${BASE_URL}/health`);

    check(response, {
        'HTTP status is 200': (r) => r.status === 200,
        'response received': (r) => r.body.length > 0
    });
}