<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\ApiProperty;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Get(security: "is_granted('ROLE_ADMIN')"),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')")
    ],
    normalizationContext: ['groups' => ['ressource:read']],
    denormalizationContext: ['groups' => ['ressource:write']]
)]
class Ressource
{
    #[Groups(['ressource:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;    #[Groups(['ressource:read', 'ressource:write'])]
    #[ORM\Column(type: 'string', length: 500)]
    #[Assert\NotBlank(message: 'L\'URL de la ressource vidéo est requise')]
    #[Assert\Url(message: 'L\'URL fournie n\'est pas valide')]
    #[Assert\Length(max: 500, maxMessage: 'L\'URL ne peut pas dépasser {{ limit }} caractères')]
    private string $contenu;    #[Groups(['ressource:read', 'ressource:write'])]
    #[ORM\ManyToOne(targetEntity: Course::class)]
    #[ORM\JoinColumn(name: 'course_id', referencedColumnName: 'id', nullable: false)]
    #[ApiProperty(readableLink: true, push: true)]
    #[Assert\NotNull(message: 'Le cours est requis')]
    private ?Course $course = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(string $contenu): self
    {
        $this->contenu = $contenu;
        return $this;
    }

    public function getCourse(): ?Course
    {
        return $this->course;
    }

    public function setCourse(?Course $course): self
    {
        $this->course = $course;
        return $this;
    }

    // Getters et setters ...
} 