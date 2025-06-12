<?php
namespace App\Entity;

use App\Repository\AffectationRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AffectationRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['affectation:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            normalizationContext: ['groups' => ['affectation:read', 'affectation:details']],
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_EMPLOYEE') and object.getUser() == user)"
        ),
        new Post(
            denormalizationContext: ['groups' => ['affectation:write']],
            normalizationContext: ['groups' => ['affectation:read']],
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')"
        )
    ],
    security: "is_granted('IS_AUTHENTICATED_FULLY')"
)]
class Affectation
{    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['affectation:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'date')]
    #[Groups(['affectation:read', 'affectation:write', 'affectation:details'])]
    private ?\DateTimeInterface $dateAssigned = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['affectation:read', 'affectation:write', 'affectation:details'])]
    private bool $assigneCours = false;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['affectation:read', 'affectation:write', 'affectation:details'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Course::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['affectation:read', 'affectation:write', 'affectation:details'])]
    private ?Course $cours = null;

    #[ORM\OneToMany(mappedBy: 'affectation', targetEntity: Evaluation::class, cascade: ['persist', 'remove'])]
    private Collection $evaluations;    public function __construct()
    {
        $this->evaluations = new ArrayCollection();
        $this->dateAssigned = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateAssigned(): ?\DateTimeInterface
    {
        return $this->dateAssigned;
    }

    public function setDateAssigned(\DateTimeInterface $dateAssigned): static
    {
        $this->dateAssigned = $dateAssigned;
        return $this;
    }

    public function isAssigneCours(): bool
    {
        return $this->assigneCours;
    }

    public function setAssigneCours(bool $assigneCours): static
    {
        $this->assigneCours = $assigneCours;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getCours(): ?Course
    {
        return $this->cours;
    }

    public function setCours(?Course $cours): static
    {
        $this->cours = $cours;
        return $this;
    }

    public function getEvaluations(): Collection
    {
        return $this->evaluations;
    }

    public function addEvaluation(Evaluation $evaluation): static
    {
        if (!$this->evaluations->contains($evaluation)) {
            $this->evaluations->add($evaluation);
            $evaluation->setAffectation($this);
        }

        return $this;
    }

    public function removeEvaluation(Evaluation $evaluation): static
    {
        if ($this->evaluations->removeElement($evaluation)) {
            // set the owning side to null (unless already changed)
            if ($evaluation->getAffectation() === $this) {
                $evaluation->setAffectation(null);
            }
        }

        return $this;
    }
}