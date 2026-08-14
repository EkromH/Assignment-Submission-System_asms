using asms_project.DTOs;
using FluentValidation;

namespace asms_project.Validators
{
    public class AppValidators 
    {
        public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
        {
            public CreateUserDtoValidator()
            {
                RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
                RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
                RuleFor(x => x.Role).Must(r => r == "Admin" || r == "Teacher" || r == "Student")
                    .WithMessage("Role must be Admin, Teacher, or Student.");
            }
        }

        public class CreateAssignmentDtoValidator : AbstractValidator<CreateAssignmentDto>
        {
            public CreateAssignmentDtoValidator()
            {
                RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
                RuleFor(x => x.Description).NotEmpty();
                RuleFor(x => x.Deadline).GreaterThan(DateTime.UtcNow).WithMessage("Deadline must be in the future.");
                RuleFor(x => x.MaxMarks).GreaterThan(0);
            }
        }

        public class GradeSubmissionDtoValidator : AbstractValidator<GradeSubmissionDto>
        {
            public GradeSubmissionDtoValidator()
            {
                RuleFor(x => x.Marks).GreaterThanOrEqualTo(0);
            }
        }
    }
}
