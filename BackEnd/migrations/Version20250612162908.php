<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250612162908 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D37ECF78B0 FOREIGN KEY (cours_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6591CC992 FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE evaluation ADD CONSTRAINT FK_1323A5756D0ABA22 FOREIGN KEY (affectation_id) REFERENCES affectation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource ADD CONSTRAINT FK_939F4544591CC992 FOREIGN KEY (course_id) REFERENCES course (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D3A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation DROP FOREIGN KEY FK_F4DD61D37ECF78B0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE evaluation DROP FOREIGN KEY FK_1323A5756D0ABA22
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource DROP FOREIGN KEY FK_939F4544591CC992
        SQL);
    }
}
