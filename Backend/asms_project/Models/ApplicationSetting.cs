using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("application_settings")]
    public class ApplicationSetting
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("application_name")]
        public string ApplicationName { get; set; } = "ASMS Portal";

        [Column("academic_year")]
        public string AcademicYear { get; set; } = "2026-2027";

        [Column("allow_late_submissions")]
        public bool AllowLateSubmissions { get; set; } = false;

        [Column("max_file_size_mb")]
        public int MaxFileSizeMb { get; set; } = 10;

        [Column("allowed_file_extensions")]
        public string AllowedFileExtensions { get; set; } = ".pdf,.docx,.zip";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
