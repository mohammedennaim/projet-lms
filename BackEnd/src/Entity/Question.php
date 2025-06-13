<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\QuestionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: QuestionRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['question:read']],
    denormalizationContext: ['groups' => ['question:write']]
)]
class Question
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['quiz:read', 'question:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 1000)]
    #[Groups(['quiz:read', 'quiz:write', 'question:read', 'question:write'])]
    #[Assert\NotBlank(message: 'Le contenu de la question est obligatoire')]
    #[Assert\Length(min: 10, minMessage: 'La question doit contenir au moins 10 caractères')]
    private ?string $content = null;

    #[ORM\ManyToOne(inversedBy: 'questions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['question:read', 'question:write'])]
    private ?Quiz $quiz = null;

    #[ORM\OneToMany(mappedBy: 'question', targetEntity: Reponse::class, orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['quiz:read', 'quiz:write', 'question:read', 'question:write'])]
    private Collection $reponses;

    public function __construct()
    {
        $this->reponses = new ArrayCollection();
    }

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

    public function getQuiz(): ?Quiz
    {
        return $this->quiz;
    }

    public function setQuiz(?Quiz $quiz): static
    {
        $this->quiz = $quiz;

        return $this;
    }

    /**
     * @return Collection<int, Reponse>
     */
    public function getReponses(): Collection
    {
        return $this->reponses;
    }

    public function addReponse(Reponse $reponse): static
    {
        if (!$this->reponses->contains($reponse)) {
            $this->reponses->add($reponse);
            $reponse->setQuestion($this);
        }

        return $this;
    }

    public function removeReponse(Reponse $reponse): static
    {
        if ($this->reponses->removeElement($reponse)) {
            // set the owning side to null (unless already changed)
            if ($reponse->getQuestion() === $this) {
                $reponse->setQuestion(null);
            }
        }

        return $this;
    }

    /**
     * Valide que la question a exactement 4 réponses et une seule correcte
     */
    public function isValid(): bool
    {
        if (count($this->reponses) !== 4) {
            return false;
        }
        
        $correctAnswers = 0;
        foreach ($this->reponses as $reponse) {
            if ($reponse->isIsCorrect()) {
                $correctAnswers++;
            }
        }
        
        return $correctAnswers === 1;
    }
    
    /**
     * Compte le nombre de réponses correctes
     */
    public function getCorrectAnswersCount(): int
    {
        $count = 0;
        foreach ($this->reponses as $reponse) {
            if ($reponse->isIsCorrect()) {
                $count++;
            }
        }
        return $count;
    }
}
