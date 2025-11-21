import 'package:flutter/material.dart';
import 'package:flutter_app/l10n/app_localizations.dart';
import 'package:flutter_app/models/question.dart';
import 'package:provider/provider.dart';
import 'package:flutter_app/providers/settings_provider.dart';

class ResultsPage extends StatelessWidget {
  const ResultsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (l == null) {
      return const Scaffold(
        body: Center(child: Text('Error: Localizations not found.')),
      );
    }

    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l.results)),
        body: Center(child: Text(l.errorNoResults)),
      );
    }

    final settingsProvider = Provider.of<SettingsProvider>(context);
    final theme = Theme.of(context);
    final langCode = settingsProvider.locale.languageCode;
    final List<Question> questions = args['questions'];
    final List<dynamic> answers = args['answers'];
    final String mode = args['mode'];

    int correctCount = 0;
    for (int i = 0; i < questions.length; i++) {
      if (mode == 'mcq') {
        if (answers[i] != null && answers[i] is int && answers[i] == questions[i].correctAnswerIndex) {
          correctCount++;
        }
      } else {
        final correctAnswer = questions[i].correctAnswer[langCode] ?? questions[i].correctAnswer['en'];
        final userAnswer = answers[i];
        if (userAnswer is String && correctAnswer != null && userAnswer.trim().toLowerCase() == correctAnswer.toLowerCase()) {
          correctCount++;
        }
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l.results),
      ),
      body: ListView.builder(
        itemCount: questions.length,
        itemBuilder: (context, index) {
          final question = questions[index];
          final userAnswer = answers[index];
          final isMcq = mode == 'mcq';

          final options = question.options?[langCode] ?? question.options?['en'];

          final bool isCorrect;
          if (isMcq) {
            isCorrect = userAnswer != null && userAnswer is int && userAnswer == question.correctAnswerIndex;
          } else {
            final correctAnswer = question.correctAnswer[langCode] ?? question.correctAnswer['en'];
            isCorrect = userAnswer is String &&
                correctAnswer != null &&
                userAnswer.trim().toLowerCase() == correctAnswer.toLowerCase();
          }

          String userAnswerText;
          if (isMcq) {
            userAnswerText = (userAnswer != null && userAnswer is int && options != null && userAnswer >= 0 && userAnswer < options.length)
                ? options[userAnswer]
                : l.notAnswered;
          } else {
            userAnswerText = (userAnswer is String && userAnswer.isNotEmpty) ? userAnswer : l.notAnswered;
          }

          String? correctAnswerText;
          if (!isCorrect) {
            if (isMcq) {
              final correctAnswerIndex = question.correctAnswerIndex;
              if (options != null && correctAnswerIndex >= 0 && correctAnswerIndex < options.length) {
                correctAnswerText = options[correctAnswerIndex];
              } else {
                correctAnswerText = 'N/A';
              }
            } else {
              correctAnswerText = question.correctAnswer[langCode] ?? question.correctAnswer['en'];
            }
          }

          final description = question.description?[langCode] ?? question.description?['en'];

          return Card(
            margin: const EdgeInsets.all(8.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${l.question} ${index + 1}: ${question.title[langCode] ?? question.title['en']}',
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  if (question.image.isNotEmpty)
                    Image.asset(question.image),
                  const SizedBox(height: 8),
                  Text(
                    '${l.yourAnswer}: $userAnswerText',
                    style: TextStyle(color: isCorrect ? Colors.green : Colors.red),
                  ),
                  const SizedBox(height: 8),
                  if (!isCorrect && correctAnswerText != null)
                    Text(
                      '${l.correctAnswer}: $correctAnswerText',
                      style: const TextStyle(color: Colors.green),
                    ),
                  const SizedBox(height: 8),
                  if (description != null)
                    Text(
                      '${l.description}: $description',
                      style: theme.textTheme.bodyMedium,
                    ),
                ],
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${l.score}: $correctCount / ${questions.length}',
              style: theme.textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
              },
              child: Text(l.backToHome),
            ),
          ],
        ),
      ),
    );
  }
}
