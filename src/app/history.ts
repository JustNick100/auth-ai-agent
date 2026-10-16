import { Injectable } from '@angular/core';
import { Timestamp, addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ResultText, TestResult } from './result';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private col() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('not-authenticated');
    return collection(db, 'users', uid, 'results');
  }

  async save(r: TestResult): Promise<void> {
    await addDoc(this.col(), {
      score: r.score,
      total: r.total,
      ru: r.ru,
      kk: r.kk,
      date: Timestamp.fromDate(r.date),
    });
  }

  async load(): Promise<TestResult[]> {
    const snap = await getDocs(query(this.col(), orderBy('date', 'desc')));
    return snap.docs.map((d) => {
      const x = d.data();
      const legacy: ResultText = {
        topic: x['topic'] ?? '',
        summary: x['summary'] ?? '',
        strengths: x['strengths'] ?? [],
        weaknesses: x['weaknesses'] ?? [],
        recommendations: x['recommendations'] ?? [],
      };
      return {
        score: x['score'],
        total: x['total'],
        date: (x['date'] as Timestamp).toDate(),
        ru: x['ru'] ?? legacy,
        kk: x['kk'] ?? legacy,
      };
    });
  }
}