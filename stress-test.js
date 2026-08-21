import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =
    'http://smartretailx-alb-620890940.ap-southeast-1.elb.amazonaws.com';

export const options = {
    scenarios: {
        stress_test: {
            executor: 'ramping-vus',

            startVUs: 1,

            stages: [
                { duration: '30s', target: 25 },
                { duration: '30s', target: 50 },
                { duration: '30s', target: 75 },
                { duration: '30s', target: 100 },
                { duration: '1m', target: 100 },
                { duration: '30s', target: 0 }
            ],

            gracefulRampDown: '30s'
        }
    }
};

export default function () {

    const response = http.get(`${BASE_URL}/health`);

    check(response, {
        'status is 200': (r) => r.status === 200
    });

    sleep(1);
}