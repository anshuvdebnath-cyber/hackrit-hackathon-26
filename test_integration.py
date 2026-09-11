import urllib.request
import json
import time
import sys

def run_tests():
    print("=====================================================================")
    print("  TERRA WATCH: FASTAPI ML & BACKEND INTEGRATION VALIDATION SUITE")
    print("=====================================================================\n")

    # 1. Health check
    print("1. Checking FastAPI ML Service /health endpoint on port 8000...")
    try:
        req = urllib.request.urlopen("http://localhost:8000/health", timeout=5)
        health = json.loads(req.read().decode())
        print("   Status:", health.get("status"))
        print("   Model loaded:", health.get("model_loaded"))
        print("   Model file:", health.get("model_file"))
        print("   Model type:", health.get("model_type"))
        print("   Features:", len(health.get("features_expected", [])), "features")
        assert health["model_loaded"] is True, "Model is not loaded!"
        print("   >>> HEALTH CHECK: PASSED\n")
    except Exception as e:
        print(f"   >>> HEALTH CHECK FAILED: {e}")
        return False

    # 2. Physics & Meteorological Scenario Validation
    print("2. Validating Physical Scenarios on XGBoost Model...")
    test_cases = [
        {
            "name": "Summer Bare Ground (No Snow)",
            "payload": {
                "snow_depth": 0.0,
                "slope_angle": 38.0,
                "wind_speed": 12.0,
                "temperature": 19.0,
                "rainfall": 0.0,
                "snow_depth_mm": 0.0,
                "relative_humidity": 55.0,
                "month": 7
            },
            "expected_level": "Low",
            "max_score": 15.0
        },
        {
            "name": "Flat Valley Plateau (Slope 12°, Deep Snowpack 50cm)",
            "payload": {
                "snow_depth": 50.0,
                "slope_angle": 12.0,
                "wind_speed": 10.0,
                "temperature": -3.0,
                "rainfall": 0.0,
                "snow_depth_mm": 500.0,
                "relative_humidity": 70.0,
                "month": 1
            },
            "expected_level": "Low",
            "max_score": 40.0
        },
        {
            "name": "Moderate Loading on Critical Couloir (Slope 38°, 45cm snow)",
            "payload": {
                "snow_depth": 45.0,
                "slope_angle": 38.0,
                "wind_speed": 28.0,
                "temperature": -4.0,
                "rainfall": 0.0,
                "snowfall_mm": 15.0,
                "snow_depth_mm": 450.0,
                "relative_humidity": 80.0,
                "month": 2
            },
            "expected_level": "Moderate",
            "min_score": 40.0,
            "max_score": 70.0
        },
        {
            "name": "Severe Himalayan Blizzard (Slope 38°, 110cm snow, 55km/h wind, fresh snow)",
            "payload": {
                "snow_depth": 110.0,
                "slope_angle": 38.0,
                "wind_speed": 55.0,
                "temperature": -7.0,
                "rainfall": 0.0,
                "snowfall_mm": 60.0,
                "snow_depth_mm": 1100.0,
                "relative_humidity": 92.0,
                "month": 1
            },
            "expected_level": "High",
            "min_score": 70.0
        }
    ]

    all_passed = True
    for tc in test_cases:
        req_data = json.dumps(tc["payload"]).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/predict",
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        resp = json.loads(urllib.request.urlopen(req).read().decode())
        score = resp["score"]
        level = resp["level"]
        top_factor = resp["topFactors"][0]
        explanation = resp["explanation"]

        passed = True
        if "expected_level" in tc and level != tc["expected_level"]:
            passed = False
        if "min_score" in tc and score < tc["min_score"]:
            passed = False
        if "max_score" in tc and score > tc["max_score"]:
            passed = False

        status = "PASSED" if passed else "FAILED"
        if not passed:
            all_passed = False

        print(f"   [{status}] {tc['name']}")
        print(f"            Score: {score}/100 | Threat Level: {level}")
        print(f"            Top Factor: {top_factor['name']} ({top_factor['importance']*100:.1f}%)")
        print(f"            Explanation: {explanation}\n")

    # 3. Stress Test on ML Service
    print("3. Conducting Stress Test on ML Microservice (50 rapid requests)...", flush=True)
    import http.client
    t0 = time.time()
    errors = 0
    N = 50
    try:
        conn = http.client.HTTPConnection("localhost", 8000, timeout=10)
        for i in range(N):
            payload_str = json.dumps({
                "snow_depth": 35.0 + (i % 30),
                "slope_angle": 30.0 + (i % 15),
                "wind_speed": 15.0 + (i % 25),
                "temperature": -5.0 + (i % 8),
                "rainfall": 0.0,
                "snow_depth_mm": (35.0 + (i % 30)) * 10,
                "month": 1
            })
            conn.request("POST", "/predict", payload_str, {"Content-Type": "application/json"})
            resp = conn.getresponse()
            resp.read()
        conn.close()
    except Exception as err:
        print(f"   Stress test error: {err}")
        errors += 1
    t_diff = time.time() - t0
    rate = N / t_diff if t_diff > 0 else 0
    print(f"   Completed {N} requests in {t_diff:.3f}s ({rate:.1f} req/sec). Errors: {errors}", flush=True)
    assert errors == 0, f"{errors} requests failed during stress test!"
    print("   >>> STRESS TEST: PASSED\n", flush=True)

    # 4. Backend End-to-End Test (Express on port 5000)
    print("4. Testing Full Backend API Endpoints (Express on port 5000)...", flush=True)
    try:
        # Test /api/villages
        req = urllib.request.urlopen("http://localhost:5000/api/villages", timeout=15)
        villages = json.loads(req.read().decode())
        print(f"   Fetched {len(villages)} villages with live satellite weather & ML inference:", flush=True)
        for v in villages[:4]:
            source = v.get("source", "unknown")
            score = v.get("avalancheRisk", {}).get("score", 0)
            level = v.get("avalancheRisk", {}).get("level", "Unknown")
            print(f"   - {v['name']}: Score={score}/100, Level={level}, Source={source}")

        # Test /api/predict-coordinate (Custom Coordinates)
        custom_payload = json.dumps({"lat": 32.2432, "lng": 77.1892}).encode("utf-8")
        req_custom = urllib.request.Request(
            "http://localhost:5000/api/predict-coordinate",
            data=custom_payload,
            headers={"Content-Type": "application/json"}
        )
        custom_resp = json.loads(urllib.request.urlopen(req_custom, timeout=15).read().decode())
        print(f"   Custom coordinate evaluation ({custom_resp['coordinates']['lat']}, {custom_resp['coordinates']['lng']}):", flush=True)
        print(f"   - Slope: {custom_resp.get('slopeAngle')}° ({custom_resp.get('slopeSource')})", flush=True)
        print(f"   - Avalanche Score: {custom_resp['avalancheRisk']['score']}/100 ({custom_resp['avalancheRisk']['level']})", flush=True)
        print(f"   - Source: {custom_resp.get('source')}", flush=True)
        print("   >>> BACKEND INTEGRATION: PASSED\n", flush=True)
    except Exception as e:
        print(f"   >>> BACKEND END-TO-END FAILED: {e}")
        all_passed = False

    print("=====================================================================")
    if all_passed:
        print("  ALL VALIDATION, STRESS, AND INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    else:
        print("  SOME TESTS REPORTED ISSUES - REVIEW ABOVE OUTPUT")
    print("=====================================================================")
    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
