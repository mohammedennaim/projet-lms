<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250612062937 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE affectation (id INT AUTO_INCREMENT NOT NULL, date_assigned DATE NOT NULL, assigne_cours TINYINT(1) NOT NULL, user_id INT NOT NULL, cours_id INT NOT NULL, INDEX IDX_F4DD61D3A76ED395 (user_id), INDEX IDX_F4DD61D37ECF78B0 (cours_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE evaluation (id INT AUTO_INCREMENT NOT NULL, note INT NOT NULL, evalue_affectation TINYINT(1) NOT NULL, affectation_id INT NOT NULL, INDEX IDX_1323A5756D0ABA22 (affectation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE ressource (id INT AUTO_INCREMENT NOT NULL, contenu VARCHAR(255) NOT NULL, cours_id INT NOT NULL, INDEX IDX_939F45447ECF78B0 (cours_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE affectation ADD CONSTRAINT FK_F4DD61D37ECF78B0 FOREIGN KEY (cours_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE evaluation ADD CONSTRAINT FK_1323A5756D0ABA22 FOREIGN KEY (affectation_id) REFERENCES affectation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource ADD CONSTRAINT FK_939F45447ECF78B0 FOREIGN KEY (cours_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6591CC992 FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments ADD CONSTRAINT FK_B8B6F1E6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
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
            ALTER TABLE evaluation DROP FOREIGN KEY FK_1323A5756D0ABA22
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE ressource DROP FOREIGN KEY FK_939F45447ECF78B0
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE affectation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE evaluation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE ressource
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE course_enrollments DROP FOREIGN KEY FK_B8B6F1E6A76ED395
        SQL);
    }
}
