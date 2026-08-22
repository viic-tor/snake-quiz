import React from 'react';
import { Star, Apple, Minimize2, Magnet, Clock, Ghost, Activity, ScanEye, ShieldAlert, Snowflake, Heart, Zap, Hourglass, Sparkles, Flame, Shield, Hammer, CircleDashed, Brain } from 'lucide-react';

const iconMap = {
  Star,
  Apple,
  Minimize2,
  Magnet,
  Clock,
  Ghost,
  Activity,
  ScanEye,
  ShieldAlert,
  Snowflake,
  Heart,
  Zap,
  Hourglass,
  Sparkles,
  Flame,
  Shield,
  Hammer,
  CircleDashed,
  Brain
};

export default function PowerupIcon({ iconId, size = 24, color = "currentColor", ...props }) {
  const Comp = iconMap[iconId];
  if (!Comp) return null;
  return <Comp size={size} color={color} {...props} />;
}
