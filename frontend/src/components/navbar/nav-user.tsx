import { Button } from "./ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "./ui/tooltip";
import { useSidebar } from "./ui/sidebar";
import { getCountryName } from '@/src/data/countries'; 

interface UserProfile {
  name: string;
  email: string;
  countryCode: string;
}

interface NavUserProps {
  user: UserProfile;
  onLogout: () => void;
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const { state, isMobile } = useSidebar();
  
  return (
    <div className="flex flex-col items-center gap-4 p-2">
      {/* 👇 Add class here to center content when the sidebar is collapsed */}
      <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            {/* The standard 4:3 flag icon will be used */}
            <span 
              className={`fi fi-${user.countryCode} text-xl shrink-0`}
              title={`${getCountryName(user.countryCode)} flag`}
            />
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            align="center"
            hidden={state !== "collapsed" || isMobile}
          >
            {user.name} ({getCountryName(user.countryCode)})
          </TooltipContent>
        </Tooltip>
        
        <div className="flex flex-col text-left min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <span className="font-semibold text-sm truncate">{user.name}</span>
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full group-data-[collapsible=icon]:hidden" 
        onClick={onLogout}
      >
        Logout
      </Button>
    </div>
  );
}