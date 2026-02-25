import React from 'react';
import {
  Upload, File, FileText, FileBarChart, X, ArrowRight, AlertTriangle,
  Copy, Download, Circle, Square, Clock, Video, Music, Send,
  CheckCircle, User, Bot, MessageCircle, Calendar, Eye, EyeOff
} from 'lucide-react';

export function Icon({ name, size = 24, className = "", stroke = 2 }) {
  const icons = {
    'upload': Upload,
    'file': File,
    'file-pdf': FileText,
    'file-ppt': FileBarChart, // Best approximation
    'x': X,
    'arrow-right': ArrowRight,
    'warning': AlertTriangle,
    'copy': Copy,
    'download': Download,
    'record-dot': Circle,
    'stop': Square,
    'clock': Clock,
    'video': Video,
    'music': Music,
    'send': Send,
    'check-circle': CheckCircle,
    'user': User,
    'bot': Bot,
    'message-circle': MessageCircle,
    'calendar': Calendar,
    'eye': Eye,
    'eye-off': EyeOff
  };

  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={className}
      strokeWidth={stroke}
      // Handle fill for record-dot and others if needed, but Lucide is mostly outline.
      // For filled icons like record-dot (Circle), we might need fill prop if intended.
      fill={name === 'record-dot' ? "currentColor" : "none"}
    />
  );
}

export default Icon;