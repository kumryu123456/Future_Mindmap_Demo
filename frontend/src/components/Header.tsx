import "./Header.css";
import { Link } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";

const Header = () => {
  return (
    <header className={`header`}>
      <div className="header-content">
        {/* 로고 및 브랜드 */}
        <div className="header-brand">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Career Pilot</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/">AI커리어설계</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="browse">둘러보기</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/dashboard">대시보드</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* 테마 토글 및 로그인/회원가입 버튼 */}
        <div className="header-right">
          <ModeToggle />
          <div className="header-auth">
            <button className="auth-button login">로그인</button>
            <button className="auth-button signup">회원가입</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
