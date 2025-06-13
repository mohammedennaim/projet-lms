<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ReponseRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ReponseRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['reponse:read']],
    denormalizationContext: ['groups' => ['reponse:write']]
)]
class Reponse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['question:read', 'reponse:read'])]
    private ?int $id = null;
    
    #[ORM\Column(length: 1000)]
    #[Groups(['quiz:read', 'quiz:write', 'question:read', 'question:write', 'reponse:read', 'reponse:write'])]
    private ?string $content = null;
    
    #[ORM\Column]
    #[Groups(['quiz:read', 'quiz:write', 'question:read', 'question:write', 'reponse:read', 'reponse:write'])]
    private ?bool $isCorrect = false;
    
    #[ORM\ManyToOne(inversedBy: 'reponses')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reponse:read', 'reponse:write'])]
    private ?Question $question = null;

    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getContent(): ?string
    {
        return $this->content;
    }
    
    public function setContent(string $content): static
    {
        $this->content = $content;
        
        return $this;
    }
    
    public function isIsCorrect(): ?bool
    {
        return $this->isCorrect;
    }
    
    public function setIsCorrect(bool $isCorrect): static
    {
        $this->isCorrect = $isCorrect;
        
        return $this;
    }
    
    public function getQuestion(): ?Question
    {
        return $this->question;
    }
    
    public function setQuestion(?Question $question): static
    {
        $this->question = $question;
        
        return $this;
    }
}
