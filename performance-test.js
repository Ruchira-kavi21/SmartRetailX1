import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =
    'http://smartretailx-alb-620890940.ap-southeast-1.elb.amazonaws.com';

export const options = {
    scenarios: {
        load_test: {
            executor: 'ramping-vus',

            startVUs: 1,

            stages: [
                { duration: '1m', target: 10 },
                { duration: '1m', target: 25 },
                { duration: '1m', target: 50 },
                { duration: '1m', target: 50 },
                { duration: '1m', target: 0 }
            ],

            gracefulRampDown: '30s'
        }
    },

    thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<2000']
    }
};

export default function () {

    const response = http.get(`${BASE_URL}/health`);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body received': (r) => r.body && r.body.length > 0
    });

    sleep(1);
}