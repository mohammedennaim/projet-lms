<?php
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 255)]
    private ?string $fullName = null;    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'affectation:read', 'affectation:details'])]
    #[Assert\Choice(choices: ['ROLE_ADMIN', 'ROLE_EMPLOYEE'], message: 'Le rôle doit être ROLE_ADMIN ou ROLE_EMPLOYEE')]
    private string $roles = 'ROLE_EMPLOYEE';

    #[ORM\Column]
    private ?string $password = null;

    #[Groups(['user:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 6)]
    private ?string $plainPassword = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getFullName(): ?string
    {
        return $this->fullName;
    }

    public function setFullName(string $fullName): static
    {
        $this->fullName = $fullName;
        return $this;
    }

    /**
     * Get first name from full name
     */
    #[Groups(['user:read'])]
    public function getFirstName(): ?string
    {
        if (!$this->fullName) {
            return null;
        }
        
        $parts = explode(' ', $this->fullName, 2);
        return $parts[0] ?? null;
    }

    /**
     * Get last name from full name
     */
    #[Groups(['user:read'])]
    public function getLastName(): ?string
    {
        if (!$this->fullName) {
            return null;
        }
        
        $parts = explode(' ', $this->fullName, 2);
        return $parts[1] ?? '';
    }

    /**
     * A visual identifier that represents this user.
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        // Convert string role to array format required by Symfony Security
        $roles = ['ROLE_USER']; // Always include ROLE_USER as a base role
        
        // Add the user's role if it's not already in ROLE_ format
        if ($this->roles && strpos($this->roles, 'ROLE_') === 0) {
            $roles[] = $this->roles;
        }
        
        return array_unique($roles);
    }

    public function setRoles(string $role): static
    {
        $this->roles = $role;
        return $this;
    }

    public function getRole(): string
    {
        return $this->roles;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        $this->plainPassword = null;
    }
}
