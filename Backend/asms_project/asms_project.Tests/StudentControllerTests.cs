using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using asms_project.Controllers;
using asms_project.Data;
using asms_project.DTOs;
using asms_project.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace asms_project.Tests
{
    public class StudentControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private void SetupUserClaims(StudentController controller, Guid userId, string role = "Student")
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task GetStudentAssignments_ShouldReturnOnlyClassSpecificAssignments()
        {
            // Arrange
            using var context = GetInMemoryDbContext();

            var class10Id = Guid.Parse("a1111111-1111-1111-1111-111111111111");
            var class9Id = Guid.Parse("a2222222-2222-2222-2222-222222222222");
            var studentId = Guid.Parse("c3333333-3333-3333-3333-333333333333");
            var subjectId = Guid.NewGuid();

            // 1. Seed Classes
            context.Classes.AddRange(
                new Class { Id = class10Id, Name = "Grade 10", Section = "A", AcademicYear = "2026" },
                new Class { Id = class9Id, Name = "Grade 9", Section = "B", AcademicYear = "2026" }
            );

            // 2. Seed Subject
            context.Subjects.Add(new Subject { Id = subjectId, Name = "Mathematics" });

            // 3. Seed Student explicitly linked to Grade 10
            context.Users.Add(new User
            {
                Id = studentId,
                FullName = "Sam Student",
                Email = "student@school.test",
                PasswordHash = "dummyhash",
                Role = "Student",
                ClassId = class10Id
            });

            // 4. Seed 1 Assignment for Grade 10 and 1 for Grade 9
            context.Assignments.AddRange(
                new Assignment
                {
                    Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                    Title = "Grade 10 Math Task",
                    ClassId = class10Id,
                    SubjectId = subjectId,
                    Deadline = DateTime.UtcNow.AddDays(7),
                    MaxMarks = 100,
                    Status = "Published"
                },
                new Assignment
                {
                    Id = Guid.NewGuid(),
                    Title = "Grade 9 History Task",
                    ClassId = class9Id,
                    SubjectId = subjectId,
                    Deadline = DateTime.UtcNow.AddDays(7),
                    MaxMarks = 100,
                    Status = "Published"
                }
            );

            await context.SaveChangesAsync();

            var controller = new StudentController(context);
            SetupUserClaims(controller, studentId);

            // Act
            var result = await controller.GetStudentAssignments();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull("Expected controller to return OkObjectResult");

            var assignmentList = okResult!.Value as IEnumerable;
            assignmentList.Should().NotBeNull("Expected okResult.Value to contain an IEnumerable list");
            assignmentList!.Cast<object>().Count().Should().Be(1);
        }

        [Fact]
        public async Task SubmitAssignment_ShouldCreateNewSubmission_WhenValid()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var studentId = Guid.NewGuid();
            var assignmentId = Guid.NewGuid();

            context.Assignments.Add(new Assignment
            {
                Id = assignmentId,
                Title = "Physics Task",
                Deadline = DateTime.UtcNow.AddDays(1),
                MaxMarks = 50,
                Status = "Published"
            });
            await context.SaveChangesAsync();

            var controller = new StudentController(context);
            SetupUserClaims(controller, studentId);

            var submissionDto = new SubmitAssignmentDto { Content = "My answer to question 1" };

            // Act
            var result = await controller.SubmitAssignment(assignmentId, submissionDto);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();

            var submissionInDb = await context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

            submissionInDb.Should().NotBeNull();
            submissionInDb!.Content.Should().Be("My answer to question 1");
        }


        [Fact]
        public async Task SubmitAssignment_ShouldPreventEdit_WhenAssignmentIsAlreadyGraded()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            var studentId = Guid.Parse("c3333333-3333-3333-3333-333333333333");
            var assignmentId = Guid.Parse("d1111111-1111-1111-1111-111111111111");
            var submissionId = Guid.NewGuid();

            context.Assignments.Add(new Assignment
            {
                Id = assignmentId,
                Title = "Graded Task",
                Deadline = DateTime.UtcNow.AddDays(1),
                MaxMarks = 100,
                Status = "Published"
            });

            context.Submissions.Add(new Submission
            {
                Id = submissionId,
                AssignmentId = assignmentId,
                StudentId = studentId,
                Content = "Old Answer",
                Status = "Graded",
                Marks = 90
            });
            await context.SaveChangesAsync();

            var controller = new StudentController(context);
            SetupUserClaims(controller, studentId);

            var submissionDto = new SubmitAssignmentDto { Content = "Updated Answer Attempt" };

            // Act - Call UpdateSubmission using submissionId
            var result = await controller.UpdateSubmission(submissionId, submissionDto);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(400);
        }
    }
}