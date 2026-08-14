using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("classes")]
    public class Class
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("section")]
        public string? Section { get; set; }

        [Column("academic_year")]
        public string AcademicYear { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Students { get; set; } = new List<User>();
        public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
    }
}

