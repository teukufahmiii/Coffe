import { 
  CupSoda, 
  GlassWater, 
  Flame, 
  Snowflake, 
  Coffee, 
  Droplets, 
  Thermometer, 
  Cookie, 
  CakeSlice, 
  Circle
} from "lucide-react";

export const CUSTOMIZATION_ICONS: Record<string, React.ElementType> = {
  CupSoda,
  GlassWater,
  Flame,
  Snowflake,
  Coffee,
  Droplets,
  Thermometer,
  Cookie,
  CakeSlice,
  Circle
};

export function renderIcon(iconName?: string, className?: string) {
  if (!iconName) return null;
  const Icon = CUSTOMIZATION_ICONS[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
}
