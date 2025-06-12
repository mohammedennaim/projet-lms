<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Evaluation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'integer')]
    private int $note;

    #[ORM\Column(type: 'boolean')]
    private bool $evalueAffectation = false;

    #[ORM\ManyToOne(targetEntity: Affectation::class, inversedBy: 'evaluations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Affectation $affectation = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNote(): int
    {
        return $this->note;
    }

    public function setNote(int $note): static
    {
        $this->note = $note;
        return $this;
    }

    public function isEvalueAffectation(): bool
    {
        return $this->evalueAffectation;
    }

    public function setEvalueAffectation(bool $evalueAffectation): static
    {
        $this->evalueAffectation = $evalueAffectation;
        return $this;
    }

    public function getAffectation(): ?Affectation
    {
        return $this->affectation;
    }

    public function setAffectation(?Affectation $affectation): static
    {
        $this->affectation = $affectation;
        return $this;
    }
}