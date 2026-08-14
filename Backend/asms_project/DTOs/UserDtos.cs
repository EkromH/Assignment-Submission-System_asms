namespace asms_project.DTOs
{
    public class CreateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Admin, Teacher, Student
        public Guid? ClassId { get; set; }
    }


    public record UpdateUserDto(
            string FullName,
            string Email,
            string Role,
            Guid? ClassId,
            string? Password
    );

    public class AssignTeacherDto
    {
        public Guid TeacherId { get; set; }
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
    }
}
