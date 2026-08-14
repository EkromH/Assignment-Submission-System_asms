namespace asms_project.DTOs
{
    public record CreateClassDto(string Name, string? Section, string AcademicYear);
    public record CreateSubjectDto(string Name, string Code);
    public record AssignClassSubjectDto(Guid ClassId, Guid SubjectId);
    public record ClassSubjectDto(Guid ClassId, Guid SubjectId);
    public class SubmitAssignmentDto
    {
        public string Content { get; set; } = string.Empty; // Text response, markdown, or file URL
    }

}
