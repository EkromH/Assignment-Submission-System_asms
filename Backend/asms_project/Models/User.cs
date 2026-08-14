using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("users")]
    public class User
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("role")]
        public string Role { get; set; } = string.Empty; // Admin, Teacher, Student

        [Column("class_id")]
        public Guid? ClassId { get; set; }
        public Class? Class { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
