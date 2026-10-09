"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { donorService } from "@/lib/donor/donor-service";
import { DonorAchievementSummary } from "@/lib/types";
import { Award, ShieldCheck, CheckCircle2, Star, Sparkles, TrendingUp } from "lucide-react";

interface DonorRewardsCardProps {
  userId: string;
}

export function DonorRewardsCard({ userId }: DonorRewardsCardProps) {
  const [achievements, setAchievements] = useState<DonorAchievementSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await donorService.getDonorAchievements(userId);
        setAchievements(res);
      } catch (err) {
        console.error("Failed to load donor rewards", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading || !achievements) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6 text-center text-xs text-slate-500">
          Loading donor rewards and verified achievements...
        </CardContent>
      </Card>
    );
  }

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "PLATINUM":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "GOLD":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "SILVER":
        return "bg-slate-200 text-slate-900 border-slate-300";
      case "BRONZE":
        return "bg-orange-100 text-orange-900 border-orange-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50/70 via-rose-50/30 to-white pb-4 border-b border-red-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                  Donor Rewards & Lifesaver Badges
                </CardTitle>
                <Badge variant="outline" className={`text-xs font-bold ${getBadgeColor(achievements.currentLevel)}`}>
                  {achievements.badgeTitle}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Earned exclusively from verified, completed donations in authorized healthcare facilities.
              </CardDescription>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-2xl font-black text-slate-900">
              {achievements.verifiedDonationsCount}
            </span>
            <span className="text-xs text-slate-500 block">Verified Donations</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Progress towards Next Badge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Progress to Next Milestone
            </span>
            <span className="text-slate-500 font-medium">
              {achievements.verifiedDonationsCount} / {achievements.nextLevelThreshold} Verified Donations ({achievements.progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${achievements.progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Tiers Badges Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                badge.isUnlocked
                  ? "bg-slate-50/80 border-slate-300 shadow-xs"
                  : "bg-slate-50/30 border-slate-200 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{badge.icon}</span>
                  {badge.isUnlocked ? (
                    <Badge variant="success" className="text-[10px] py-0 px-1.5 gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {badge.thresholdDonations} req.
                    </Badge>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600">
                Threshold: {badge.thresholdDonations} donation{badge.thresholdDonations > 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground italic border-t pt-2">
          * Social impact figures and milestone rewards are calculated strictly from confirmed clinical records to prevent duplicate or fabricated contributions.
        </p>
      </CardContent>
    </Card>
  );
}
