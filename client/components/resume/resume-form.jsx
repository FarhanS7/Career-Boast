"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

export default function ResumeForm({ register, control, errors, watch }) {
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name *</label>
            <input
              {...register("personalInfo.name")}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
            {errors.personalInfo?.name && (
              <p className="text-red-400 text-sm mt-1">{errors.personalInfo.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
              <input
                type="email"
                {...register("personalInfo.email")}
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                placeholder="john@example.com"
              />
              {errors.personalInfo?.email && (
                <p className="text-red-400 text-sm mt-1">{errors.personalInfo.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Phone *</label>
              <input
                type="tel"
                {...register("personalInfo.phone")}
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                placeholder="+1 (555) 123-4567"
              />
              {errors.personalInfo?.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.personalInfo.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
              <input
                {...register("personalInfo.location")}
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                placeholder="New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Website/LinkedIn</label>
              <input
                {...register("personalInfo.website")}
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Professional Summary</h2>
        <textarea
          {...register("summary")}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none resize-none"
          placeholder="A brief summary of your professional background, key achievements, and career goals..."
        />
        {errors.summary && (
          <p className="text-red-400 text-sm mt-1">{errors.summary.message}</p>
        )}
      </section>

      {/* Work Experience */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Work Experience</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExperience({
              company: "",
              position: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            })}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>

        <div className="space-y-6">
          {experienceFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">Experience #{index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Position *</label>
                  <input
                    {...register(`experience.${index}.position`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Company *</label>
                  <input
                    {...register(`experience.${index}.company`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Tech Corp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                  <input
                    {...register(`experience.${index}.location`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date *</label>
                  <input
                    type="month"
                    {...register(`experience.${index}.startDate`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">End Date</label>
                  <input
                    type="month"
                    {...register(`experience.${index}.endDate`)}
                    disabled={watch(`experience.${index}.current`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`experience.${index}.current`)}
                  className="w-4 h-4 rounded bg-black border-white/10"
                />
                <label className="text-sm text-zinc-300">I currently work here</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  {...register(`experience.${index}.description`)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Key responsibilities and achievements..."
                />
              </div>
            </div>
          ))}

          {experienceFields.length === 0 && (
            <p className="text-center text-zinc-500 py-8">No experience added yet. Click "Add Experience" to get started.</p>
          )}
        </div>
      </section>

      {/* Education */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Education</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEducation({
              institution: "",
              degree: "",
              field: "",
              startDate: "",
              endDate: "",
              gpa: "",
            })}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>

        <div className="space-y-6">
          {educationFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">Education #{index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Degree *</label>
                  <input
                    {...register(`education.${index}.degree`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Bachelor of Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Field of Study *</label>
                  <input
                    {...register(`education.${index}.field`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Institution *</label>
                <input
                  {...register(`education.${index}.institution`)}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="University of California"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date *</label>
                  <input
                    type="month"
                    {...register(`education.${index}.startDate`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">End Date *</label>
                  <input
                    type="month"
                    {...register(`education.${index}.endDate`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">GPA (Optional)</label>
                  <input
                    {...register(`education.${index}.gpa`)}
                    className="w-full px-4 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="3.8"
                  />
                </div>
              </div>
            </div>
          ))}

          {educationFields.length === 0 && (
            <p className="text-center text-zinc-500 py-8">No education added yet. Click "Add Education" to get started.</p>
          )}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
        <input
          {...register("skills")}
          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
          placeholder="JavaScript, React, Node.js, Python (comma-separated)"
        />
        <p className="text-xs text-zinc-500 mt-1">Separate skills with commas</p>
      </section>

      {/* Certifications */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Certifications (Optional)</h2>
        <input
          {...register("certifications")}
          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
          placeholder="AWS Certified Developer, Google Cloud Professional (comma-separated)"
        />
        <p className="text-xs text-zinc-500 mt-1">Separate certifications with commas</p>
      </section>

      {/* Languages */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Languages (Optional)</h2>
        <input
          {...register("languages")}
          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-blue-500 focus:outline-none"
          placeholder="English (Native), Spanish (Fluent) (comma-separated)"
        />
        <p className="text-xs text-zinc-500 mt-1">Separate languages with commas</p>
      </section>
    </div>
  );
}
