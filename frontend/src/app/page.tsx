'use client'

import { GlassCard, GlassButton, GlassBadge } from '@/components/ui'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ThemedIcon } from '@/lib/icons'
import { useState, useEffect } from 'react'

const rarityColors = [
  'from-gray-400 to-gray-600',
  'from-green-400 to-green-600', 
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-yellow-400 to-yellow-600'
];

const features = [
  {
    icon: 'coins',
    title: 'Community-Funded Pools', 
    description: 'Deposit your NFTs to earn yield while funding gacha pools. The community owns and operates the entire ecosystem.',
    stats: 'Earn Yield'
  },
  {
    icon: 'gem',
    title: 'Deposit & Spin Model',
    description: 'Contributors deposit NFTs by rarity, spinners pay fees. Fair distribution of rewards based on community participation.',
    stats: 'Community Owned'
  },
  {
    icon: 'trophy',
    title: 'Transparent Rewards',
    description: 'All deposits and rewards are tracked on-chain. Contributors earn tokens based on their NFT deposits and rarity.',
    stats: 'On-Chain Tracking'
  }
];

const stats = [
  { value: '10,000+', label: 'NFTs Available' },
  { value: '5', label: 'Rarity Levels' },
  { value: '100%', label: 'Fair Drops' },
  { value: '24/7', label: 'Available' }
];

export default function LandingPage() {
  const [currentRarity, setCurrentRarity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRarity((prev) => (prev + 1) % rarityColors.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-content1/5">
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${rarityColors[i % rarityColors.length].replace('from-', 'rgba(').replace(' to-', ', 0.03) 0%, rgba(').replace('-400', '').replace('-600', ', 0.01)')} 100%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <GlassBadge variant="primary" className="inline-flex items-center gap-2 text-sm px-4 py-2">
              <ThemedIcon name="coins" size="sm" />
              <span className="font-medium">Community-Funded NFT Gacha</span>
            </GlassBadge>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                Spin-Fi
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground/80">
                Deposit. Earn. Spin.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl lg:text-2xl text-foreground/70 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Join the first{' '}
            <span className="text-warning font-medium">community-owned</span> NFT gacha platform.
            Deposit your NFTs to earn yield, or spin to discover rare collectibles. 
            <span className="text-warning font-medium"> Fair rewards</span> for contributors and transparent mechanics for all.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/discover">
              <GlassButton 
                variant="primary" 
                size="lg" 
                className="min-w-56 h-14 text-lg font-semibold"
                animate={true}
              >
                <div className="flex items-center gap-2">
                  <ThemedIcon name="coins" size="md" />
                  <span>Deposit & Earn</span>
                </div>
              </GlassButton>
            </Link>
            
            <Link href="/gacha?id=pudgy-penguins">
              <GlassButton 
                variant="secondary" 
                size="lg" 
                className="min-w-56 h-14 text-lg"
                animate={true}
              >
                <div className="flex items-center gap-2">
                  <ThemedIcon name="dice" size="md" />
                  <span>Start Spinning</span>
                </div>
              </GlassButton>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/60 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Interactive Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <ThemedIcon name="gem" size="lg" className="text-warning" />
          </motion.div>
        ))}
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <GlassBadge variant="info" className="mb-6">
              <ThemedIcon name="coins" size="sm" />
              <span className="ml-2">Community Benefits</span>
            </GlassBadge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
                Earn While You
              </span>
              <br />
              <span className="text-foreground">Contribute</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              The first community-owned gacha where NFT holders earn yield by contributing to the prize pools. 
              Fair rewards for depositors, transparent mechanics for spinners.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <GlassCard 
                  variant="interactive" 
                  className="h-full p-8 text-center relative overflow-hidden group-hover:shadow-lg group-hover:shadow-warning/10"
                  animate={true}
                >
                  
                  {/* Icon */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-warning/20 to-orange-400/20 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-warning/20 transition-all duration-300">
                    <ThemedIcon name={feature.icon} size="xl" variant="accent" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <GlassBadge variant="primary" size="xs" className="text-xs">
                        {feature.stats}
                      </GlassBadge>
                    </div>
                    <p className="text-foreground/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Rarity Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlassCard className="p-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
                  Rarity-Based Yield System
                </h3>
                <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
                  Higher rarity NFT deposits earn more yield. Contributors are rewarded based on the scarcity and value they bring to the community.
                </p>
                <div className="flex justify-center items-center gap-4 flex-wrap">
                  {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map((rarity, index) => (
                    <motion.div
                      key={rarity}
                      animate={currentRarity === index ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GlassBadge 
                        variant={currentRarity === index ? "primary" : "info"}
                        className={`${currentRarity === index ? 'shadow-lg shadow-warning/30' : ''}`}
                      >
                        {rarity}
                      </GlassBadge>
                    </motion.div>
                  ))}
                </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 md:p-16 text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-warning to-orange-400 rounded-2xl flex items-center justify-center shadow-xl shadow-warning/30"
                >
                  <ThemedIcon name="zap" size="xl" className="text-black" />
                </motion.div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
                    Join the Community
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Deposit your NFTs to earn yield, or spin to discover rare treasures. 
                  Built by the community, owned by the community, rewarding the community.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/discover">
                    <GlassButton 
                      variant="primary" 
                      size="lg"
                      className="min-w-64 h-16 text-xl font-bold"
                      animate={true}
                    >
                      <div className="flex items-center gap-3">
                        <ThemedIcon name="coins" size="lg" />
                        <span>Start Earning Now</span>
                      </div>
                    </GlassButton>
                  </Link>
                  
                  <div className="flex items-center gap-3 text-foreground/60">
                    <ThemedIcon name="trophy" size="md" variant="accent" />
                    <span className="text-sm font-medium">Community Owned & Operated</span>
                  </div>
                </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
