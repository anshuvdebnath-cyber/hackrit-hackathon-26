"""
Comprehensive Extreme Validation & Stress Testing Suite for Terra Watch ML Service & Backend.
Validates:
1. Extreme parameter boundaries and physical consistency
2. 20 real diverse geographical coordinates across the Himalayas
3. High-concurrency throughput and burst stress testing (120 requests)
4. TreeSHAP attribution and mathematical correctness (conservation law)
5. Boundary clamping, extreme anomalous weather inputs, and robustness
"""

import sys
import os
import time
import json
import http.client
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

FASTAPI_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:5000"

def log_header(title):
    print("\n" + "=" * 75, flush=True)
    print(f"  {title}", flush=True)
    print("=" * 75, flush=True)

def test_fastapi_direct(payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f"{FASTAPI_URL}/predict",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode())

def test_backend_coordinate(lat, lng, slope=None):
    payload = {"lat": lat, "lng": lng}
    if slope is not None:
        payload["slope_angle"] = slope
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f"{BACKEND_URL}/api/predict-coordinate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())

def run_extreme_stress_test():
    all_passed = True
    issues = []

    # =========================================================================
    # MODULE 1: Extreme Parameter Boundaries & Physical Consistency
    # =========================================================================
    log_header("MODULE 1: Extreme Parameter Boundaries & Physics Consistency")

    scenarios = [
        {
            "name": "1.1 Extreme Arctic Blizzard (-40°C, 100km/h wind, 250cm snowpack, 38° slope, month 1)",
            "payload": {
                "temperature": -40.0, "dewpoint_C": -42.0, "wind_speed": 100.0,
                "snow_depth": 250.0, "snow_depth_mm": 2500.0, "snowfall_mm": 80.0,
                "slope_angle": 38.0, "pressure_hPa": 640.0, "relative_humidity": 95.0, "month": 1
            },
            "validator": lambda r: r["level"] == "High" and r["score"] >= 75.0,
            "desc": "Must evaluate to High Risk (>75)"
        },
        {
            "name": "1.2 Summer High Plains (+35°C, 0cm snow, 0 rain, 8° slope, month 6)",
            "payload": {
                "temperature": 35.0, "dewpoint_C": 18.0, "wind_speed": 12.0,
                "snow_depth": 0.0, "snow_depth_mm": 0.0, "snowfall_mm": 0.0,
                "slope_angle": 8.0, "pressure_hPa": 900.0, "relative_humidity": 30.0, "month": 6
            },
            "validator": lambda r: r["level"] == "Low" and r["score"] <= 15.0,
            "desc": "Must evaluate to Low Risk (<=15) since ground is bare"
        },
        {
            "name": "1.3 Rain-on-Snow Wet Avalanche Trigger (+3°C, 90mm rain, 70cm snowpack, 37° slope)",
            "payload": {
                "temperature": 3.0, "dewpoint_C": 2.0, "wind_speed": 35.0, "rainfall": 90.0, "precip_mm": 90.0,
                "snow_depth": 70.0, "snow_depth_mm": 700.0, "snowfall_mm": 0.0,
                "slope_angle": 37.0, "pressure_hPa": 710.0, "relative_humidity": 98.0, "month": 3
            },
            "validator": lambda r: r["score"] >= 65.0,
            "desc": "Must trigger severe instability (>65) due to liquid water intrusion"
        },
        {
            "name": "1.4 Zero Snowpack on Precipitous 45° Cliff (Steep but no snow fuel)",
            "payload": {
                "temperature": -5.0, "wind_speed": 40.0,
                "snow_depth": 0.0, "snow_depth_mm": 0.0, "snowfall_mm": 0.0,
                "slope_angle": 45.0, "pressure_hPa": 680.0, "relative_humidity": 70.0, "month": 12
            },
            "validator": lambda r: r["level"] == "Low" and r["score"] <= 15.0,
            "desc": "Must be Low Risk (<=15) because an avalanche cannot release with zero snow"
        },
        {
            "name": "1.5 Massive Snowpack (300cm) on Flat Ground (0° slope)",
            "payload": {
                "temperature": -8.0, "wind_speed": 20.0,
                "snow_depth": 300.0, "snow_depth_mm": 3000.0, "snowfall_mm": 10.0,
                "slope_angle": 0.0, "pressure_hPa": 700.0, "relative_humidity": 80.0, "month": 2
            },
            "validator": lambda r: r["level"] == "Low" or r["score"] < 45.0,
            "desc": "Must remain Low/Low-Moderate (<45) because flat ground lacks gravitational shear"
        },
        {
            "name": "1.6 Hurricane Wind Slabs (140 km/h wind gusts, 45cm snowpack, 36° slope)",
            "payload": {
                "temperature": -12.0, "wind_speed": 140.0,
                "snow_depth": 45.0, "snow_depth_mm": 450.0, "snowfall_mm": 15.0,
                "slope_angle": 36.0, "pressure_hPa": 650.0, "relative_humidity": 85.0, "month": 1
            },
            "validator": lambda r: r["score"] >= 50.0 and any(f["feature"] == "wind_speed" for f in r["topFactors"][:3]),
            "desc": "Must elevate risk (>50) and rank wind_speed in top 3 factors"
        }
    ]

    for sc in scenarios:
        try:
            res = test_fastapi_direct(sc["payload"])
            score = res.get("score")
            level = res.get("level")
            factors = res.get("topFactors", [])
            valid = sc["validator"](res)
            
            if score is None or not isinstance(score, (int, float)) or score != score:
                raise ValueError("Score is NaN or None")
            
            status_str = "[PASS]" if valid else "[FAIL]"
            print(f"  {status_str} {sc['name']}", flush=True)
            print(f"         Score: {score}/100 | Level: {level} | Top: {factors[0]['name']} ({factors[0]['importance']*100:.1f}%)", flush=True)
            if not valid:
                all_passed = False
                issues.append(f"Boundary scenario failed: {sc['name']} - Got score {score}, level {level} (Expected: {sc['desc']})")
        except Exception as e:
            all_passed = False
            issues.append(f"Boundary scenario crashed: {sc['name']} -> {e}")
            print(f"  [CRASH] {sc['name']}: {e}", flush=True)

    # Slope monotonicity test from 0 to 75 degrees
    print("\n  Testing Slope Sweep (0° to 75°):", flush=True)
    base_pl = {
        "temperature": -4.0, "wind_speed": 25.0, "snow_depth": 50.0,
        "snow_depth_mm": 500.0, "snowfall_mm": 10.0, "pressure_hPa": 700.0, "relative_humidity": 80.0, "month": 1
    }
    slope_scores = []
    for s in [0, 15, 25, 32, 38, 45, 55, 70]:
        base_pl["slope_angle"] = s
        r = test_fastapi_direct(base_pl)
        slope_scores.append((s, r["score"]))
    
    print("    " + " | ".join([f"{s}°: {sc}" for s, sc in slope_scores]), flush=True)
    peak_slope = max(slope_scores, key=lambda x: x[1])
    if peak_slope[0] not in [32, 38, 45]:
        issues.append(f"Physics violation: Peak avalanche hazard occurred at {peak_slope[0]}° instead of prime 32°-45° zone")
        all_passed = False
        print(f"    [WARN] Peak slope score occurred at {peak_slope[0]}°", flush=True)
    else:
        print(f"    [PASS] Peak hazard occurs at {peak_slope[0]}° (within peak 32°-45° slab release zone)", flush=True)

    # =========================================================================
    # MODULE 2: 20 Real Diverse Geographical Coordinates Across Himalayas
    # =========================================================================
    log_header("MODULE 2: Real Geographical Coordinates Across Himalayas (Open-Meteo + DEM + Model)")

    points = [
        {"name": "Gulmarg Backcountry (J&K)", "lat": 34.05, "lng": 74.38},
        {"name": "Dras Cold Sub-Sector (Ladakh)", "lat": 34.43, "lng": 75.76},
        {"name": "Zanskar Chamshen (Ladakh)", "lat": 33.50, "lng": 76.90},
        {"name": "Khardung La High Pass (Ladakh)", "lat": 34.28, "lng": 77.60},
        {"name": "Pangong Tso Alpine Basin", "lat": 33.75, "lng": 78.65},
        {"name": "Rohtang Ridge / Atal Tunnel (HP)", "lat": 32.37, "lng": 77.18},
        {"name": "Spiti Valley Kibber Couloir (HP)", "lat": 32.33, "lng": 78.01},
        {"name": "Kinnaur Kalpa Slopes (HP)", "lat": 31.54, "lng": 78.25},
        {"name": "Badrinath / Mana Pass (UK)", "lat": 30.74, "lng": 79.49},
        {"name": "Nanda Devi Basin (UK)", "lat": 30.38, "lng": 79.97},
        {"name": "Gangotri Glacier Pass (UK)", "lat": 30.92, "lng": 79.08},
        {"name": "Kanchenjunga Range (Sikkim)", "lat": 27.70, "lng": 88.15},
        {"name": "Tawang / Sela Pass (Arunachal)", "lat": 27.50, "lng": 92.10},
        {"name": "Shimla Southern Ridge (HP)", "lat": 31.10, "lng": 77.17},
        {"name": "Dharamshala Triund Chute (HP)", "lat": 32.25, "lng": 76.35},
        {"name": "Munsyari Johar Valley (UK)", "lat": 30.07, "lng": 80.24},
        {"name": "Nubra Valley / Diskit (Ladakh)", "lat": 34.68, "lng": 77.56},
        {"name": "Siachen Glacial Sector", "lat": 35.20, "lng": 77.10},
        {"name": "Valley of Flowers Chute (UK)", "lat": 30.73, "lng": 79.58},
        {"name": "Hemkund High Altitude Pass (UK)", "lat": 30.70, "lng": 79.62},
        {"name": "Arabian Sea Offshore (Ocean Water)", "lat": 15.00, "lng": 70.00, "is_water": True},
        {"name": "Bay of Bengal Marine (Ocean Water)", "lat": 12.00, "lng": 85.00, "is_water": True}
    ]

    def test_single_point(p):
        t0 = time.time()
        try:
            res = test_backend_coordinate(p["lat"], p["lng"])
            duration = time.time() - t0
            score = res.get("avalancheRisk", {}).get("score")
            level = res.get("avalancheRisk", {}).get("level")
            slope = res.get("slopeAngle")
            elev = res.get("elevation")
            temp = res.get("weather", {}).get("temperature")
            wind = res.get("weather", {}).get("windSpeed")
            snow = res.get("weather", {}).get("snowDepth")
            source = res.get("source")
            factors = res.get("topFactors", [])

            assert score is not None and 0.0 <= score <= 100.0, f"Invalid score {score}"
            assert level in ["Low", "Moderate", "High"], f"Invalid level {level}"
            assert slope is not None and slope >= 0.0, f"Invalid DEM slope {slope}"
            assert elev is not None and elev >= 0, f"Invalid elevation {elev}"
            assert source in ["live-fastapi-xgboost", "water-body-guard", "marine-physics-guard"], f"Unexpected source {source}"

            # If water body or ocean, verify avalanche and flood risks are guarded
            if p.get("is_water"):
                assert score == 0.0, f"Water body avalanche risk should be 0, got {score}"
                assert slope == 0.0, f"Water surface slope should be 0, got {slope}"
                assert elev == 0, f"Ocean elevation should be 0, got {elev}"
                assert res.get("floodRisk", {}).get("score") == 0, f"Ocean flood score should be 0, got {res.get('floodRisk', {}).get('score')}"

            return {
                "name": p["name"], "lat": p["lat"], "lng": p["lng"],
                "score": score, "level": level, "slope": slope, "elev": elev,
                "temp": temp, "wind": wind, "snow": snow, "duration": duration, "ok": True
            }
        except Exception as e:
            return {
                "name": p["name"], "lat": p["lat"], "lng": p["lng"],
                "error": str(e), "ok": False
            }

    # Run with 4 concurrent threads so satellite calls resolve fast
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(test_single_point, p): p for p in points}
        for future in as_completed(futures):
            pt_res = future.result()
            if pt_res["ok"]:
                print(f"  [PASS] {pt_res['name']:<34} ({pt_res['lat']:.2f}°, {pt_res['lng']:.2f}°): "
                      f"Score={pt_res['score']:<4} | {pt_res['level']:<8} | Slope={pt_res['slope']}° | "
                      f"Elev={pt_res['elev']}m | Temp={pt_res['temp']}°C | Wind={pt_res['wind']}km/h | {pt_res['duration']*1000:.0f}ms", flush=True)
            else:
                all_passed = False
                issues.append(f"Geographical point failed: {pt_res['name']} ({pt_res['lat']}, {pt_res['lng']}) -> {pt_res['error']}")
                print(f"  [FAIL] {pt_res['name']}: {pt_res['error']}", flush=True)

    # =========================================================================
    # MODULE 3: High-Concurrency Burst & Throughput Stress Test
    # =========================================================================
    log_header("MODULE 3: High-Concurrency Burst Stress Testing (FastAPI :8000)")

    NUM_REQUESTS = 120
    CONCURRENCY = 15
    print(f"  Firing {NUM_REQUESTS} requests at FastAPI with concurrency={CONCURRENCY}...", flush=True)

    def make_conn_req(idx):
        conn = http.client.HTTPConnection("localhost", 8000, timeout=10)
        payload_data = json.dumps({
            "snow_depth": 40.0 + (idx % 60),
            "slope_angle": 25.0 + (idx % 25),
            "wind_speed": 15.0 + (idx % 35),
            "temperature": -2.0 - (idx % 15),
            "rainfall": 0.0 if (idx % 4 != 0) else 5.0,
            "snowfall_mm": 5.0 + (idx % 20),
            "snow_depth_mm": (40.0 + (idx % 60)) * 10,
            "pressure_hPa": 680.0 + (idx % 50),
            "relative_humidity": 65.0 + (idx % 30),
            "month": (idx % 12) + 1
        })
        t_start = time.time()
        conn.request("POST", "/predict", payload_data, {"Content-Type": "application/json"})
        resp = conn.getresponse()
        raw = resp.read()
        conn.close()
        t_lat = (time.time() - t_start) * 1000
        status = resp.status
        data = json.loads(raw.decode())
        return status, t_lat, data

    latencies = []
    concurrency_errors = 0
    t_bench_start = time.time()

    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(make_conn_req, i) for i in range(NUM_REQUESTS)]
        for f in as_completed(futures):
            try:
                status, lat, res_data = f.result()
                if status != 200 or "score" not in res_data:
                    concurrency_errors += 1
                else:
                    latencies.append(lat)
            except Exception:
                concurrency_errors += 1

    bench_time = time.time() - t_bench_start
    throughput = NUM_REQUESTS / bench_time if bench_time > 0 else 0

    latencies.sort()
    p50 = latencies[len(latencies)//2] if latencies else 0
    p95 = latencies[int(len(latencies)*0.95)] if latencies else 0
    p99 = latencies[int(len(latencies)*0.99)] if latencies else 0

    print(f"  Completed {NUM_REQUESTS} requests in {bench_time:.2f}s", flush=True)
    print(f"  Throughput:    {throughput:.1f} req/sec", flush=True)
    print(f"  Latency P50:   {p50:.1f} ms", flush=True)
    print(f"  Latency P95:   {p95:.1f} ms", flush=True)
    print(f"  Latency P99:   {p99:.1f} ms", flush=True)
    print(f"  Errors:        {concurrency_errors}", flush=True)

    if concurrency_errors > 0:
        all_passed = False
        issues.append(f"Concurrency stress test had {concurrency_errors}/{NUM_REQUESTS} failed requests")
    else:
        print("  >>> CONCURRENCY BURST: 100% SUCCESSFUL (0 ERRORS)", flush=True)

    # =========================================================================
    # MODULE 4: TreeSHAP Attribution & Mathematical Correctness
    # =========================================================================
    log_header("MODULE 4: TreeSHAP Attribution & Mathematical Correctness")

    shap_test_payload = {
        "temperature": -15.0,
        "dewpoint_C": -18.0,
        "wind_speed": 75.0,
        "snow_depth": 90.0,
        "snow_depth_mm": 900.0,
        "snowfall_mm": 35.0,
        "slope_angle": 38.0,
        "pressure_hPa": 650.0,
        "relative_humidity": 90.0,
        "month": 1
    }

    res_shap = test_fastapi_direct(shap_test_payload)
    factors = res_shap["topFactors"]
    sum_weights = sum(f["importance"] for f in factors)
    print("  Evaluating 9-feature TreeSHAP decomposition on high storm vector...", flush=True)
    for idx, f in enumerate(factors):
        print(f"    {idx+1}. {f['name']:<25} ({f['feature']:<18}): {f['importance']*100:.1f}%", flush=True)
    print(f"  Total summed attribution weight: {sum_weights*100:.2f}%", flush=True)

    if abs(sum_weights - 1.0) > 0.02:
        all_passed = False
        issues.append(f"TreeSHAP sum mismatch: Factors sum to {sum_weights*100:.1f}%, expected 100%")
    else:
        print("  [PASS] Mathematical conservation: Weights properly sum to 100.0%", flush=True)

    # =========================================================================
    # MODULE 5: Extreme Boundary Clamping & Anomaly Handling
    # =========================================================================
    log_header("MODULE 5: Extreme Boundary Clamping & Anomaly Handling")

    extreme_cases = [
        {
            "name": "5.1 Super-Tornado Wind (250 km/h wind speed)",
            "payload": {"temperature": -5.0, "wind_speed": 250.0, "snow_depth": 60.0, "slope_angle": 35.0},
            "check": lambda r: r["score"] >= 60.0 and r["level"] in ["Moderate", "High"]
        },
        {
            "name": "5.2 Deepest Glacial Snow (1500 cm / 15 meters)",
            "payload": {"temperature": -10.0, "wind_speed": 30.0, "snow_depth": 1500.0, "slope_angle": 36.0},
            "check": lambda r: r["score"] >= 70.0 and r["level"] == "High"
        },
        {
            "name": "5.3 Deep Arctic Freeze (-65°C)",
            "payload": {"temperature": -65.0, "wind_speed": 10.0, "snow_depth": 40.0, "slope_angle": 30.0},
            "check": lambda r: 0.0 <= r["score"] <= 100.0
        },
        {
            "name": "5.4 Extreme Tropical Heatwave (+55°C)",
            "payload": {"temperature": 55.0, "wind_speed": 10.0, "snow_depth": 0.0, "slope_angle": 20.0},
            "check": lambda r: r["score"] <= 15.0 and r["level"] == "Low"
        },
        {
            "name": "5.5 Vertical Overhang / Cliff (90° slope)",
            "payload": {"temperature": -2.0, "wind_speed": 20.0, "snow_depth": 5.0, "slope_angle": 90.0},
            "check": lambda r: 0.0 <= r["score"] <= 100.0
        }
    ]

    for ec in extreme_cases:
        try:
            r = test_fastapi_direct(ec["payload"])
            valid = ec["check"](r)
            status = "[PASS]" if valid else "[FAIL]"
            print(f"  {status} {ec['name']} -> Score: {r['score']} ({r['level']})", flush=True)
            if not valid:
                all_passed = False
                issues.append(f"Extreme anomaly check failed: {ec['name']}")
        except Exception as e:
            all_passed = False
            issues.append(f"Extreme anomaly check crashed: {ec['name']} -> {e}")
            print(f"  [CRASH] {ec['name']} -> {e}", flush=True)

    # =========================================================================
    # FINAL SUMMARY REPORT
    # =========================================================================
    log_header("FINAL VALIDATION & STRESS TEST REPORT")
    print(f"  Overall System Health: {'PERFECT (100% PASS)' if all_passed else 'ISSUES DETECTED'}", flush=True)
    print(f"  Total Anomalies Found: {len(issues)}", flush=True)
    if issues:
        print("  Issues to address:", flush=True)
        for iss in issues:
            print(f"    - {iss}", flush=True)
    else:
        print("  All physical scenarios, geographical sectors, burst loads, and TreeSHAP mathematics passed flawlessly.", flush=True)
    print("=" * 75 + "\n", flush=True)

    return all_passed, issues

if __name__ == "__main__":
    success, issues = run_extreme_stress_test()
    sys.exit(0 if success else 1)
