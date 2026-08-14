namespace asms_project.DTOs
{
    public record UserResponseDto(
     Guid Id,
     string FullName,
     string Email,
     string Role,
     Guid? ClassId,
     string? ClassName
 );
}
