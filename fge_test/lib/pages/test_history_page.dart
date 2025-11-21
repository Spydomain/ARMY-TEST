
import 'package:flutter/material.dart';
import 'package:fge_test/l10n/app_localizations.dart';
import 'package:fge_test/providers/test_history_provider.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class TestHistoryPage extends StatelessWidget {
  const TestHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (l == null) {
      return const Scaffold(
        body: Center(child: Text('Error: Localizations not found.')),
      );
    }

    final testHistoryProvider = Provider.of<TestHistoryProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l.testHistory),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: Text(l.clearHistory),
                    content: Text(l.clearHistoryConfirmation),
                    actions: [
                      TextButton(
                        child: Text(l.cancel),
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                      ),
                      TextButton(
                        child: Text(l.clear),
                        onPressed: () {
                          testHistoryProvider.clearHistory();
                          Navigator.of(context).pop();
                        },
                      ),
                    ],
                  );
                },
              );
            },
          ),
        ],
      ),
      body: testHistoryProvider.testHistory.isEmpty
          ? Center(
              child: Text(l.noHistory),
            )
          : ListView.builder(
              itemCount: testHistoryProvider.testHistory.length,
              itemBuilder: (context, index) {
                final test = testHistoryProvider.testHistory[index];
                final formattedDate = DateFormat.yMMMd().add_Hms().format(test.date);

                return ListTile(
                  title: Text('${l.test} - ${test.category}'),
                  subtitle: Text(formattedDate),
                  trailing: Text('${test.score}/${test.totalQuestions}'),
                  onTap: () {
                    Navigator.pushNamed(context, '/results', arguments: {
                      'questions': test.questions,
                      'answers': test.answers,
                      'mode': test.mode,
                    });
                  },
                );
              },
            ),
    );
  }
}
