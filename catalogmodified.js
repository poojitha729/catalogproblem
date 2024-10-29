class ShamirSecret {
    constructor() {
        this.charToValue = new Map();
        this.initCharMap();
    }

    initCharMap() {
        // Initialize digits 0-9
        for (let i = 0; i < 10; i++) {
            this.charToValue.set(String(i), i);
        }
        // Initialize letters a-f for hex
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode('a'.charCodeAt(0) + i);
            this.charToValue.set(char, 10 + i);
            this.charToValue.set(char.toUpperCase(), 10 + i);
        }
    }

    decodeValue(value, base) {
        base = BigInt(base);
        let result = 0n;
        
        for (const char of value) {
            result = result * base + BigInt(this.charToValue.get(char));
        }
        
        return result;
    }

    parsePoints(data) {
        const points = [];
        const n = data.keys.n;

        for (let i = 1; i <= n; i++) {
            const point = data[i];
            const x = BigInt(i);
            const y = this.decodeValue(point.value, point.base);
            points.push({ x, y });
        }

        return points;
    }

    lagrangeInterpolation(points, k) {
        // Use only k points
        points = points.slice(0, k);
        let secret = 0n;

        for (let i = 0; i < k; i++) {
            let numerator = 1n;
            let denominator = 1n;
            const currentPoint = points[i];

            for (let j = 0; j < k; j++) {
                if (i !== j) {
                    const otherPoint = points[j];
                    // For x = 0, we only need the numerator terms
                    numerator *= -otherPoint.x;
                    denominator *= (currentPoint.x - otherPoint.x);
                }
            }

            const term = currentPoint.y * numerator / denominator;
            secret += term;
        }

        return secret;
    }

    findSecret(data) {
        const k = data.keys.k;
        const points = this.parsePoints(data);
        return this.lagrangeInterpolation(points, k);
    }
}

// Test cases
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "4": {
        "base": "4",
        "value": "213"
    }
};

const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d63"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

try {
    const shamir = new ShamirSecret();
    
    // Find secrets for both test cases
    const secret1 = shamir.findSecret(testCase1);
    const secret2 = shamir.findSecret(testCase2);
    
    console.log("Test Case 1 Secret:", secret1.toString());
    console.log("Test Case 2 Secret:", secret2.toString());
} catch (error) {
    console.error("Error:", error.message);
}
