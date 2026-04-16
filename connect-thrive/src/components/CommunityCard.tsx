import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CommunityCardProps {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  members: number;
  color: string;
  gradient: string;
  index: number; // New prop// New prop
}

const CommunityCard = ({
  id,
  name,
  description,
  icon: Icon,
  members,
  color,
  gradient,
  index,
}: CommunityCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative group">
        <div
          onClick={() => navigate(`/community/${id}`)}
          className="community-card glass-card p-6 h-full cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02]"
        >
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}
          />

          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${gradient}`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-display font-semibold mb-2">{name}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{members}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityCard;
