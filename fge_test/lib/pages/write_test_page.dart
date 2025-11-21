import 'package:flutter/material.dart';
import 'package:fge_test/l10n/app_localizations.dart';
import 'package:fge_test/models/category.dart';
import 'package:fge_test/models/question.dart';
import 'package:fge_test/models/test.dart';
import 'package:fge_test/models/test_data.dart';
import 'package:fge_test/providers/test_history_provider.dart';
import 'package:provider/provider.dart';
import 'package:fge_test/providers/settings_provider.dart';

class WriteTestPage extends StatefulWidget {
  final Category category;
  final int questionCount;

  const WriteTestPage({super.key, required this.category, this.questionCount = 10});

  @override
  State<WriteTestPage> createState() => _WriteTestPageState();
}

class _WriteTestPageState extends State<WriteTestPage> {
  late List<Question> _questions;
  late List<String?> _answers;
  late List<TextEditingController> _textControllers;
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _isInitialized = false;
  bool _isSubmitting = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      _questions = getQuestionsForCategory(widget.category.id, widget.questionCount, 'write');
      _answers = List.generate(_questions.length, (_) => null);
      _textControllers = _answers.map((answer) => TextEditingController(text: answer)).toList();
      _isInitialized = true;
    }
  }

  @override
  void dispose() {
    for (final controller in _textControllers) {
      controller.dispose();
    }
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
    final settingsProvider = Provider.of<SettingsProvider>(context, listen: false);

    int correctCount = 0;
    final langCode = settingsProvider.locale.languageCode;
    for (int i = 0; i < _questions.length; i++) {
      final correctAnswer = _questions[i].correctAnswer[langCode] ?? _questions[i].correctAnswer['en'];
      final userAnswer = _answers[i];
      if (userAnswer != null && correctAnswer != null && userAnswer.trim().toLowerCase() == correctAnswer.toLowerCase()) {
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
      answers: _answers,
      mode: 'write',
    );

    testHistoryProvider.addTest(test);

    navigator.pushReplacementNamed('/results', arguments: {
      'questions': _questions,
      'answers': _answers,
      'mode': 'write',
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

  void _onAnswerChanged(int index, String value) {
    _answers[index] = value;
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

    if (!_isInitialized || _questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: _isInitialized ? Text(l.noQuestionsAvailable) : const CircularProgressIndicator(),
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
          title: Text(l.writeAnswer),
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
                            TextField(
                              controller: _textControllers[index],
                              onChanged: (value) => _onAnswerChanged(index, value),
                              decoration: InputDecoration(
                                labelText: l.typeYourAnswer,
                                border: const OutlineInputBorder(),
                              ),
                            ),
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
  }
}
