import asyncio
from playwright.async_api import async_playwright
import json
import os
from datetime import datetime

async def comprehensive_browser_analysis():
    """Perform comprehensive browser analysis of the mindmap application"""
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "url": "http://localhost:5180",
        "analysis": {},
        "screenshots": [],
        "console_logs": [],
        "network_requests": [],
        "performance_metrics": {},
        "errors": [],
        "navigation_tests": {},
        "responsive_tests": {},
        "ui_components": {}
    }
    
    async with async_playwright() as p:
        # Launch browser with debugging enabled
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-web-security', '--disable-features=VizDisplayCompositor']
        )
        
        # Create browser context with viewport
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
        # Enable console and network monitoring
        page = await context.new_page()
        
        # Collect console messages
        console_logs = []
        network_requests = []
        page_errors = []
        
        def handle_console(msg):
            console_logs.append({
                "type": msg.type,
                "text": msg.text,
                "location": str(msg.location) if msg.location else None,
                "timestamp": datetime.now().isoformat()
            })
        
        def handle_request(request):
            network_requests.append({
                "url": request.url,
                "method": request.method,
                "resource_type": request.resource_type,
                "timestamp": datetime.now().isoformat()
            })
        
        def handle_page_error(error):
            page_errors.append({
                "message": str(error),
                "timestamp": datetime.now().isoformat()
            })
        
        page.on('console', handle_console)
        page.on('request', handle_request)
        page.on('pageerror', handle_page_error)
        
        try:
            print("🌐 Navigating to application...")
            
            # Navigate with extended timeout
            await page.goto("http://localhost:5180", wait_until='networkidle', timeout=30000)
            
            # Wait for initial load
            await page.wait_for_timeout(3000)
            
            # Take initial screenshot
            screenshot_path = "initial_load.png"
            await page.screenshot(path=screenshot_path, full_page=True)
            results["screenshots"].append({
                "name": "initial_load",
                "path": screenshot_path,
                "description": "Initial application load"
            })
            
            print("✅ Initial navigation successful!")
            
            # Analyze page title and basic structure
            title = await page.title()
            results["analysis"]["title"] = title
            
            # Check for main elements
            try:
                app_element = await page.query_selector('#root')
                if app_element:
                    results["analysis"]["react_root"] = "Found React root element"
                    
                    # Get app element content info
                    app_content = await page.evaluate('document.getElementById("root").innerHTML.length')
                    results["analysis"]["app_content_length"] = app_content
                    
                else:
                    results["errors"].append({
                        "message": "React root element not found", 
                        "timestamp": datetime.now().isoformat()
                    })
            except Exception as e:
                results["errors"].append({
                    "message": f"Error checking root element: {str(e)}", 
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check for navigation elements
            try:
                nav_elements = await page.query_selector_all('nav, .nav, [role="navigation"]')
                results["ui_components"]["navigation_count"] = len(nav_elements)
                
                # Look for specific navigation links
                nav_links = await page.query_selector_all('a[href], button')
                nav_link_texts = []
                for link in nav_links[:10]:  # Limit to first 10
                    try:
                        text = await link.inner_text()
                        if text.strip():
                            nav_link_texts.append(text.strip())
                    except:
                        pass
                results["ui_components"]["navigation_links"] = nav_link_texts
                
            except Exception as e:
                results["errors"].append({
                    "message": f"Error analyzing navigation: {str(e)}", 
                    "timestamp": datetime.now().isoformat()
                })
            
            # Test for common UI patterns
            try:
                # Check for loading indicators
                loading_elements = await page.query_selector_all('.loading, .spinner, [data-testid*="loading"]')
                results["ui_components"]["loading_indicators"] = len(loading_elements)
                
                # Check for main content areas
                main_elements = await page.query_selector_all('main, .main, .content, .app-content')
                results["ui_components"]["main_content_areas"] = len(main_elements)
                
                # Check for buttons
                buttons = await page.query_selector_all('button')
                results["ui_components"]["button_count"] = len(buttons)
                
            except Exception as e:
                results["errors"].append({
                    "message": f"Error analyzing UI components: {str(e)}", 
                    "timestamp": datetime.now().isoformat()
                })
            
            # Collect all console logs and network requests
            results["console_logs"] = console_logs
            results["network_requests"] = network_requests
            results["errors"].extend(page_errors)
            
            print(f"📊 Analysis complete. Console logs: {len(console_logs)}, Network requests: {len(network_requests)}, Errors: {len(page_errors)}")
            
            return results
            
        except Exception as e:
            results["errors"].append({
                "message": f"Navigation failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            })
            print(f"❌ Navigation failed: {e}")
            return results
        
        finally:
            await browser.close()

async def main():
    results = await comprehensive_browser_analysis()
    
    # Save results to JSON
    with open('browser_analysis_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("📝 Results saved to browser_analysis_results.json")
    return results

# Run the analysis
if __name__ == "__main__":
    results = asyncio.run(main())