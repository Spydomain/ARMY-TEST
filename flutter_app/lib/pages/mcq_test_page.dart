import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_app/l10n/app_localizations.dart';
import 'package:flutter_app/models/category.dart';
import 'package:flutter_app/models/question.dart';
import 'package:flutter_app/models/test.dart';
import 'package:flutter_app/models/test_data.dart';
import 'package:flutter_app/providers/test_history_provider.dart';
import 'package:flutter_app/services/question_service.dart';
import 'package:provider/provider.dart';
import 'package:flutter_app/providers/settings_provider.dart';

class McqTestPage extends StatefulWidget {
  final Category category;
  final int questionCount;

  const McqTestPage({super.key, required this.category, this.questionCount = 10});

  @override
  State<McqTestPage> createState() => _McqTestPageState();
}

class _McqTestPageState extends State<McqTestPage> {
  late Future<void> _initQuestionsFuture;
  late List<Question> _questions;
  late List<int> _answers;
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _isSubmitting = false;
  final QuestionService _questionService = QuestionService();

  @override
  void initState() {
    super.initState();
    _initQuestionsFuture = _initializeQuestions();
  }

  Future<void> _initializeQuestions() async {
    final answeredQuestions = await _questionService.getAnsweredQuestions(widget.category.id);
    // Add a small delay to avoid UI freeze on fast devices
    await Future.delayed(const Duration(milliseconds: 100));
    _questions = getQuestionsForCategory(
      widget.category.id,
      widget.questionCount,
      'mcq',
      answeredQuestions: answeredQuestions,
    );
    if (_questions.isNotEmpty) {
      _answers = List.generate(_questions.length, (_) => -1);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _submitTest() async {
    if (_isSubmitting) return;
    setState(() {
      _isSubmitting = true;
    });

    final navigator = Navigator.of(context);
    final testHistoryProvider = Provider.of<TestHistoryProvider>(context, listen: false);

    int correctCount = 0;
    for (int i = 0; i < _questions.length; i++) {
      if (_answers[i] != -1 && _answers[i] == _questions[i].correctAnswerIndex) {
        correctCount++;
      }
    }

    final test = Test(
      id: DateTime.now().toIso8601String(),
      category: widget.category.name(AppLocalizations.of(context)!),
      score: correctCount,
      totalQuestions: _questions.length,
      date: DateTime.now(),
      questions: _questions,
      answers: _answers.map((e) => e.toString()).toList(),
      mode: 'mcq',
    );

    testHistoryProvider.addTest(test);

    final answeredQuestionIds = _questions.map((q) => q.id).toList();
    await _questionService.saveAnsweredQuestions(widget.category.id, answeredQuestionIds);

    navigator.pushReplacementNamed('/results', arguments: {
      'questions': _questions,
      'answers': _answers,
      'mode': 'mcq',
    });
  }

  void _nextPage() {
    if (_currentPage < _questions.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.ease,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.ease,
      );
    }
  }

  void _onAnswerSelected(int index, int optionIndex) {
    if (_answers[index] != -1) return;
    setState(() {
      _answers[index] = optionIndex;
    });
  }

  Future<bool> _showExitConfirmationDialog() async {
    final l = AppLocalizations.of(context)!;
    final shouldPop = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.exitTest),
        content: Text(l.areYouSureYouWantToSubmit),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l.submit),
          ),
        ],
      ),
    );
    return shouldPop ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (l == null) {
      return const Scaffold(
        body: Center(child: Text('Error: Localizations not found.')),
      );
    }

    final settingsProvider = Provider.of<SettingsProvider>(context);
    final theme = Theme.of(context);
    final langCode = settingsProvider.locale.languageCode;

    return FutureBuilder<void>(
      future: _initQuestionsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.hasError || _questions.isEmpty) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(
              child: Text(snapshot.hasError ? 'Error loading questions.' : l.noQuestionsAvailable),
            ),
          );
        }

        final isLastPage = _currentPage == _questions.length - 1;

        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool didPop, dynamic result) async {
            if (didPop) {
              return;
            }
            final shouldSubmit = await _showExitConfirmationDialog();
            if (shouldSubmit) {
              await _submitTest();
            }
          },
          child: Scaffold(
            appBar: AppBar(
              title: Text(l.mcq),
            ),
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Expanded(
                      child: PageView.builder(
                        controller: _pageController,
                        itemCount: _questions.length,
                        onPageChanged: (index) {
                          setState(() {
                            _currentPage = index;
                          });
                        },
                        itemBuilder: (context, index) {
                          final question = _questions[index];
                          final title = question.title[langCode] ?? question.title['en'] ?? 'N/A';
                          final options = question.options?[langCode] ?? question.options?['en'] ?? [];
                          final answer = _answers[index];

                          return SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  '${l.question} ${index + 1}/${_questions.length}: $title',
                                  style: theme.textTheme.titleLarge,
                                ),
                                const SizedBox(height: 24),
                                if (question.image.isNotEmpty)
                                  ConstrainedBox(
                                    constraints: BoxConstraints(
                                      maxHeight: MediaQuery.of(context).size.height * 0.3,
                                    ),
                                    child: Image.asset(
                                      question.image,
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                                const SizedBox(height: 24),
                                ...options.asMap().entries.map((entry) {
                                  final optionIndex = entry.key;
                                  final optionText = entry.value;
                                  final isAnswered = answer != -1;
                                  final isSelected = answer == optionIndex;
                                  final isCorrect = optionIndex == question.correctAnswerIndex;

                                  Color? cardColor;
                                  Icon? trailingIcon;

                                  if (isAnswered) {
                                    if (isSelected) {
                                      if (isCorrect) {
                                        cardColor = Colors.green.shade100;
                                        trailingIcon = const Icon(Icons.check_circle, color: Colors.green);
                                      } else {
                                        cardColor = Colors.red.shade100;
                                        trailingIcon = const Icon(Icons.cancel, color: Colors.red);
                                      }
                                    } else if (isCorrect) {
                                      cardColor = Colors.green.shade100;
                                      trailingIcon = const Icon(Icons.check_circle, color: Colors.green);
                                    }
                                  }

                                  return Card(
                                    color: cardColor,
                                    elevation: 2,
                                    margin: const EdgeInsets.symmetric(vertical: 6),
                                    child: ListTile(
                                      title: Text(optionText),
                                      trailing: trailingIcon,
                                      onTap: isAnswered ? null : () => _onAnswerSelected(index, optionIndex),
                                    ),
                                  );
                                }),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (_currentPage > 0)
                          ElevatedButton.icon(
                            onPressed: _previousPage,
                            icon: const Icon(Icons.arrow_back),
                            label: Text(l.previous),
                          )
                        else
                          const SizedBox(),
                        if (!isLastPage)
                          ElevatedButton.icon(
                            onPressed: _nextPage,
                            icon: const Icon(Icons.arrow_forward),
                            label: Text(l.next),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: _submitTest,
                            icon: const Icon(Icons.check_circle),
                            label: Text(l.submit),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.primary,
                              foregroundColor: theme.colorScheme.onPrimary,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
