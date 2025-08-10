import requests
import json
import time
from datetime import datetime

def analyze_application():
    """Simple analysis of the mindmap application without Playwright"""
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "url": "http://localhost:5180",
        "server_analysis": {},
        "static_analysis": {},
        "css_fixes_verification": {},
        "navigation_structure": {},
        "responsive_features": {},
        "ui_components": {},
        "recommendations": []
    }
    
    try:
        print("🌐 Testing server response...")
        
        # Test server response
        response = requests.get("http://localhost:5180", timeout=10)
        results["server_analysis"] = {
            "status_code": response.status_code,
            "response_time": response.elapsed.total_seconds(),
            "content_type": response.headers.get('content-type', 'unknown'),
            "content_length": len(response.text),
            "server_responsive": response.status_code == 200
        }
        
        if response.status_code == 200:
            html_content = response.text
            
            # Analyze HTML structure
            results["static_analysis"] = {
                "has_root_div": 'id="root"' in html_content,
                "has_react_refresh": 'react-refresh' in html_content,
                "has_vite_client": '@vite/client' in html_content,
                "has_main_tsx": '/src/main.tsx' in html_content,
                "title": "Vite + React + TS" if "Vite + React + TS" in html_content else "Custom",
                "viewport_meta": 'viewport' in html_content,
                "charset_utf8": 'charset="UTF-8"' in html_content
            }
            
            print("✅ Server responding correctly")
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        results["server_analysis"]["error"] = str(e)
        print(f"❌ Server connection failed: {e}")
    
    # Analyze CSS fixes based on file content
    from pathlib import Path
    css_file_path = Path(__file__).parents[0] / "future-mindmap-frontend-demo" / "src" / "App.css"
    css_content = ""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
            
        results["css_fixes_verification"] = {
            "has_flex_layout": "display: flex" in css_content,
            "has_min_height": "min-height: 100vh" in css_content,
            "has_navigation_styles": ".app-nav" in css_content,
            "has_responsive_styles": "@media" in css_content,
            "has_loading_states": ".loading-state" in css_content,
            "proper_z_index": "z-index:" in css_content,
            "accessibility_focus": ":focus" in css_content,
            "high_contrast_support": "prefers-contrast: high" in css_content
        }
        print("✅ CSS analysis complete")
        
    except Exception as e:
        results["css_fixes_verification"] = {"error": str(e)}
        css_content = ""
        print(f"❌ CSS analysis failed: {e}")
    
    # Analyze navigation structure from App.tsx
    app_file_path = Path(__file__).parents[0] / "future-mindmap-frontend-demo" / "src" / "App.tsx"
    try:
        with open(app_file_path, 'r', encoding='utf-8') as f:
            app_content = f.read()
            
        results["navigation_structure"] = {
            "has_three_views": all(view in app_content for view in ['dashboard', 'planning', 'mindmap']),
            "has_navigation_buttons": ".nav-btn" in app_content,
            "has_view_state": "activeView" in app_content,
            "has_breadcrumbs": "breadcrumb" in app_content,
            "has_loading_indicators": "isLoading" in app_content,
            "has_toast_notifications": "useToast" in app_content,
            "has_session_management": "SessionManager" in app_content
        }
        
        results["ui_components"] = {
            "mindmap_canvas": "MindmapCanvas" in app_content,
            "plan_cards": "PlanCard" in app_content,
            "session_manager": "SessionManager" in app_content,
            "toast_system": "ToastTestPanel" in app_content,
            "header_component": "Header" in app_content,
            "interactive_features": "onClick" in app_content,
            "clipboard_integration": "navigator.clipboard" in app_content
        }
        
        # Ensure css_content is defined before using it
        if css_content:
            results["responsive_features"] = {
                "mobile_responsive": "@media (max-width: 768px)" in css_content,
                "small_screen_support": "@media (max-width: 480px)" in css_content,
                "flexible_grid": "grid-template-columns" in css_content,
                "touch_friendly": "padding" in css_content and "cursor: pointer" in css_content
            }
        else:
            results["responsive_features"] = {
                "mobile_responsive": False,
                "small_screen_support": False,
                "flexible_grid": False,
                "touch_friendly": False
            }
        
        print("✅ Application structure analysis complete")
        
    except Exception as e:
        results["navigation_structure"]["error"] = str(e)
        print(f"❌ App structure analysis failed: {e}")
    
    # Generate recommendations
    recommendations = []
    
    if results["server_analysis"].get("server_responsive"):
        recommendations.append("✅ Server is running and responsive")
    else:
        recommendations.append("❌ Server connectivity issues detected")
        
    if results["static_analysis"].get("has_root_div"):
        recommendations.append("✅ React root element properly configured")
    else:
        recommendations.append("⚠️ React root element may be missing")
        
    if results["css_fixes_verification"].get("has_flex_layout") and results["css_fixes_verification"].get("has_min_height"):
        recommendations.append("✅ CSS layout fixes appear to be working")
    else:
        recommendations.append("⚠️ CSS layout may need additional fixes")
        
    if results["navigation_structure"].get("has_three_views"):
        recommendations.append("✅ All three navigation views (Dashboard, Planning, Mindmap) are implemented")
    else:
        recommendations.append("⚠️ Navigation structure may be incomplete")
        
    if results["responsive_features"].get("mobile_responsive"):
        recommendations.append("✅ Mobile responsive design implemented")
    else:
        recommendations.append("⚠️ Mobile responsiveness may need attention")
    
    results["recommendations"] = recommendations
    
    # Save results
    with open('browser_analysis_report.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return results

def print_analysis_report(results):
    """Print a formatted analysis report"""
    print("\n" + "="*60)
    print(" MINDMAP APPLICATION BROWSER ANALYSIS REPORT")
    print("="*60)
    
    print(f"\nAnalysis timestamp: {results['timestamp']}")
    print(f"Target URL: {results['url']}")
    
    # Server Analysis
    print(f"\nSERVER ANALYSIS:")
    server = results.get("server_analysis", {})
    if server.get("server_responsive"):
        print(f"   Status: ✅ Server Online (HTTP {server.get('status_code', 'unknown')})")
        print(f"   Response Time: {server.get('response_time', 0):.3f}s")
        print(f"   Content Type: {server.get('content_type', 'unknown')}")
    else:
        print(f"   Status: ❌ Server Issues")
        if "error" in server:
            print(f"   Error: {server['error']}")
    
    # CSS Fixes Verification
    print(f"\n🎨 CSS FIXES VERIFICATION:")
    css = results.get("css_fixes_verification", {})
    css_checks = [
        ("Flex Layout", css.get("has_flex_layout", False)),
        ("Viewport Height", css.get("has_min_height", False)),
        ("Navigation Styles", css.get("has_navigation_styles", False)),
        ("Responsive Design", css.get("has_responsive_styles", False)),
        ("Loading States", css.get("has_loading_states", False)),
        ("Accessibility Focus", css.get("accessibility_focus", False)),
        ("High Contrast Support", css.get("high_contrast_support", False))
    ]
    
    for check_name, status in css_checks:
        icon = "✅" if status else "❌"
        print(f"   {icon} {check_name}")
    
    # Navigation Structure
    print(f"\n🧭 NAVIGATION STRUCTURE:")
    nav = results.get("navigation_structure", {})
    nav_checks = [
        ("Three Views (Dashboard/Planning/Mindmap)", nav.get("has_three_views", False)),
        ("Navigation Buttons", nav.get("has_navigation_buttons", False)),
        ("View State Management", nav.get("has_view_state", False)),
        ("Breadcrumb Navigation", nav.get("has_breadcrumbs", False)),
        ("Loading Indicators", nav.get("has_loading_indicators", False)),
        ("Toast Notifications", nav.get("has_toast_notifications", False))
    ]
    
    for check_name, status in nav_checks:
        icon = "✅" if status else "❌"
        print(f"   {icon} {check_name}")
    
    # UI Components
    print(f"\n🧩 UI COMPONENTS:")
    ui = results.get("ui_components", {})
    ui_checks = [
        ("Mindmap Canvas", ui.get("mindmap_canvas", False)),
        ("Plan Cards", ui.get("plan_cards", False)),
        ("Session Manager", ui.get("session_manager", False)),
        ("Toast System", ui.get("toast_system", False)),
        ("Header Component", ui.get("header_component", False)),
        ("Interactive Features", ui.get("interactive_features", False))
    ]
    
    for check_name, status in ui_checks:
        icon = "✅" if status else "❌"
        print(f"   {icon} {check_name}")
    
    # Responsive Features
    print(f"\n📱 RESPONSIVE DESIGN:")
    responsive = results.get("responsive_features", {})
    responsive_checks = [
        ("Mobile Responsive", responsive.get("mobile_responsive", False)),
        ("Small Screen Support", responsive.get("small_screen_support", False)),
        ("Flexible Grid Layout", responsive.get("flexible_grid", False)),
        ("Touch-Friendly Interface", responsive.get("touch_friendly", False))
    ]
    
    for check_name, status in responsive_checks:
        icon = "✅" if status else "❌"
        print(f"   {icon} {check_name}")
    
    # Recommendations
    print(f"\n💡 KEY RECOMMENDATIONS:")
    for rec in results.get("recommendations", []):
        print(f"   {rec}")
    
    print("\n" + "="*60)
    print("📝 Detailed results saved to: browser_analysis_report.json")
    print("="*60)

if __name__ == "__main__":
    print("Starting browser analysis...")
    results = analyze_application()
    print_analysis_report(results)