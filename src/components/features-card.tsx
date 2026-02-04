import { motion } from "motion/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { Feature } from "@/types/props";

export const FeaturesCard = ({
  feature,
}: {
  feature: Feature;
}) => {

  const cardVariants = {
    rest: {},
    hover: {},
  }

  const iconVariants = {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      key={feature.title}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={cardVariants}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="h-full"
    >
      <motion.div
        whileHover={{ 
          scale: 1.05, 
          y: -5,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{ height: "100%" }}
      >
        <Card className="h-full transition-shadow p-4">
          <CardHeader>
            <motion.div 
              className={`w-12 h-12 rounded-lg bg-linear-to-r ${feature.color} p-2 mb-4`}
              variants={iconVariants}
            >
              <feature.icon className="w-full h-full text-white" />
            </motion.div>
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  );
};