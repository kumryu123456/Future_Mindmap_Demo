import requests
import json
from datetime import datetime
from pathlib import Path

def test_application():
    results = {
        "timestamp": datetime.now().isoformat(),
        "url": "http://localhost:5180",
        "tests": {}
    }
    
    print("Starting browser analysis...")
    
    try:
        # Test server response
        print("Testing server response...")
        response = requests.get("http://localhost:5180", timeout=10)
        
        results["tests"]["server_status"] = response.status_code
        results["tests"]["response_time"] = response.elapsed.total_seconds()
        results["tests"]["server_working"] = response.status_code == 200
        
        if response.status_code == 200:
            html = response.text
            results["tests"]["has_react_root"] = 'id="root"' in html
            results["tests"]["has_vite"] = 'vite' in html.lower()
            results["tests"]["has_react"] = 'react' in html.lower()
            print("Server is working correctly!")
        else:
            print(f"Server returned status: {response.status_code}")
            
    except Exception as e:
        results["tests"]["error"] = str(e)
        print(f"Server test failed: {e}")
    
    # Test CSS file
    try:
        css_path = Path(__file__).parent / "future-mindmap-frontend-demo" / "src" / "App.css"
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        results["tests"]["css_has_layout"] = "display: flex" in css_content
        results["tests"]["css_has_navigation"] = ".app-nav" in css_content
        results["tests"]["css_has_responsive"] = "@media" in css_content
        results["tests"]["css_fixes_present"] = all([
            "display: flex" in css_content,
            "min-height: 100vh" in css_content,
            ".app-nav" in css_content
        ])
        print("CSS analysis complete!")
        
    except Exception as e:
        results["tests"]["css_error"] = str(e)
        print(f"CSS test failed: {e}")
    
    # Test App.tsx
    try:
        app_path = Path(__file__).parent / "future-mindmap-frontend-demo" / "src" / "App.tsx"
        with open(app_path, 'r', encoding='utf-8') as f:
            app_content = f.read()
        
        results["tests"]["app_has_navigation"] = all([
            'dashboard' in app_content,
            'planning' in app_content,  
            'mindmap' in app_content
        ])
        import re
        results["tests"]["app_has_components"] = all([
            'MindmapCanvas' in app_content,
            re.search(r'(SessionManager|TestSessionManager)', app_content) is not None,
            'PlanCard' in app_content
        ])
        print("App structure analysis complete!")
        
    except Exception as e:
        results["tests"]["app_error"] = str(e)
        print(f"App test failed: {e}")
    
    # Print results
    print("\n" + "="*50)
    print("ANALYSIS RESULTS")
    print("="*50)
    
    for key, value in results["tests"].items():
        if key.endswith("_error"):
            print(f"ERROR - {key}: {value}")
        elif isinstance(value, bool):
            status = "PASS" if value else "FAIL"
            print(f"{status} - {key}")
        else:
            print(f"INFO - {key}: {value}")
    
    print("="*50)
    
    # Save results
    results_path = Path(__file__).parent / 'analysis_results.json'
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("Results saved to analysis_results.json")
    return results

if __name__ == "__main__":
    test_application()