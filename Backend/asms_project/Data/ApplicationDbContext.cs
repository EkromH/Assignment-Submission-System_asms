using Microsoft.EntityFrameworkCore;
using asms_project.Models;

namespace asms_project.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<ClassSubject> ClassSubjects => Set<ClassSubject>();
    public DbSet<TeacherAssignment> TeacherAssignments => Set<TeacherAssignment>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<ApplicationSetting> ApplicationSettings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Subject>().HasIndex(s => s.Code).IsUnique();
        modelBuilder.Entity<ClassSubject>().HasIndex(cs => new { cs.ClassId, cs.SubjectId }).IsUnique();
        modelBuilder.Entity<TeacherAssignment>().HasIndex(ta => new { ta.TeacherId, ta.ClassId, ta.SubjectId }).IsUnique();
        modelBuilder.Entity<Submission>().HasIndex(s => new { s.AssignmentId, s.StudentId }).IsUnique();

        // Foreign keys & Navigation
        modelBuilder.Entity<User>()
            .HasOne(u => u.Class)
            .WithMany(c => c.Students)
            .HasForeignKey(u => u.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Submission>()
            .HasOne(s => s.GradedByUser)
            .WithMany()
            .HasForeignKey(s => s.GradedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}