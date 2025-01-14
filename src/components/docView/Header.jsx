import { Home, Monitor, Share2, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">Customer Targeting Strategy</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Monitor className="h-4 w-4 mr-2" />
          Theme
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="primary" size="sm">
              Present
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>From beginning</DropdownMenuItem>
            <DropdownMenuItem>From current slide</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
        <Button 
          className="h-8 w-8 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
          variant="ghost"
        >
          V
        </Button>
      </div>
    </header>
  );
}
