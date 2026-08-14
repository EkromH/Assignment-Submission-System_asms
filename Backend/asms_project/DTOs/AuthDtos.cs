namespace asms_project.DTOs
{
    public record LoginDto(
     string Email,
     string Password
 );

    public record AuthResponseDto(
        string Token,
        string Email,
        string Role,
        DateTime ExpiresAt
    );
}
