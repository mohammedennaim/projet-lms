<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613002419 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE question (id INT AUTO_INCREMENT NOT NULL, content VARCHAR(1000) NOT NULL, quiz_id INT NOT NULL, INDEX IDX_B6F7494E853CD175 (quiz_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE quiz (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description VARCHAR(1000) DEFAULT NULL, course_id INT DEFAULT NULL, INDEX IDX_A412FA92591CC992 (course_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reponse (id INT AUTO_INCREMENT NOT NULL, content VARCHAR(1000) NOT NULL, is_correct TINYINT(1) NOT NULL, question_id INT NOT NULL, INDEX IDX_5FB6DEC71E27F6BF (question_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE question ADD CONSTRAINT FK_B6F7494E853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quiz ADD CONSTRAINT FK_A412FA92591CC992 FOREIGN KEY (course_id) REFERENCES course (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reponse ADD CONSTRAINT FK_5FB6DEC71E27F6BF FOREIGN KEY (question_id) REFERENCES question (id)
        SQL);
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
            ALTER TABLE question DROP FOREIGN KEY FK_B6F7494E853CD175
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quiz DROP FOREIGN KEY FK_A412FA92591CC992
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reponse DROP FOREIGN KEY FK_5FB6DEC71E27F6BF
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE question
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quiz
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reponse
        SQL);
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
