import { FaBriefcase, FaCertificate, FaEnvelope, FaGlobe, FaGraduationCap, FaLanguage, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export default function ModernTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, certifications, languages } = data;

  return (
    <div className="bg-white text-black min-h-[11in] w-[8.5in]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header with accent color */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <h1 className="text-4xl font-bold mb-3">{personalInfo?.name || "Your Name"}</h1>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {personalInfo?.email && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center gap-2">
              <FaPhone className="w-4 h-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo?.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo?.website && (
            <div className="flex items-center gap-2">
              <FaGlobe className="w-4 h-4" />
              <span>{personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-8">
        {/* Left Column - 1/3 width */}
        <div className="col-span-1 space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide">Skills</h2>
              <div className="space-y-1">
                {skills.map((skill, index) => (
                  <div key={index} className="text-sm bg-gray-100 px-3 py-1 rounded">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide flex items-center gap-2">
                <FaCertificate className="w-4 h-4" />
                Certifications
              </h2>
              <ul className="text-sm space-y-1">
                {certifications.map((cert, index) => (
                  <li key={index} className="leading-snug">{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide flex items-center gap-2">
                <FaLanguage className="w-4 h-4" />
                Languages
              </h2>
              <ul className="text-sm space-y-1">
                {languages.map((lang, index) => (
                  <li key={index}>{lang}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - 2/3 width */}
        <div className="col-span-2 space-y-6">
          {/* Professional Summary */}
          {summary && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide">Profile</h2>
              <p className="text-sm leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide flex items-center gap-2">
                <FaBriefcase className="w-4 h-4" />
                Experience
              </h2>
              {experience.map((exp, index) => (
                <div key={index} className="mb-4 border-l-2 border-blue-600 pl-4">
                  <h3 className="text-base font-semibold">{exp.position}</h3>
                  <p className="text-sm font-medium text-blue-700">{exp.company} • {exp.location}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-blue-700 uppercase tracking-wide flex items-center gap-2">
                <FaGraduationCap className="w-4 h-4" />
                Education
              </h2>
              {education.map((edu, index) => (
                <div key={index} className="mb-3 border-l-2 border-blue-600 pl-4">
                  <h3 className="text-base font-semibold">{edu.degree} in {edu.field}</h3>
                  <p className="text-sm text-blue-700">{edu.institution}</p>
                  <p className="text-xs text-gray-600">
                    {edu.startDate} - {edu.endDate}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
