"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Building2, Calendar, CheckCircle2, ExternalLink, MapPin, XCircle } from "lucide-react";

export default function JobCard({ job, matchScore, explanation, skillsMatched = [], skillsMissing = [] }) {
  // Determine match color based on score
  const getMatchColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="line-clamp-2 text-lg" title={job.title}>
              {job.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-bold ${getMatchColor(matchScore)}`}>
              {Math.round(matchScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Match</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </div>
          )}
          {job.postedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(job.postedAt), "MMM d")}
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {job.source}
          </Badge>
        </div>

        {explanation && (
          <div className="bg-muted/30 p-3 rounded-md text-sm">
            <p className="line-clamp-3 text-muted-foreground italic">
              "{explanation}"
            </p>
          </div>
        )}

        <div className="space-y-3">
          {skillsMatched.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1 flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-3 h-3" /> Matched Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {skillsMatched.slice(0, 5).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {skill}
                  </Badge>
                ))}
                {skillsMatched.length > 5 && (
                  <span className="text-xs text-muted-foreground">+{skillsMatched.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {skillsMissing.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1 flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" /> Missing Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {skillsMissing.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <Button className="w-full" asChild>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            Apply Now <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
