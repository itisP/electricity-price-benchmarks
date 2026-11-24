(() => {
  'use strict';

  // Publisher launch and the archived weights used in these runs can have different dates.
  const giftHistory = ['GIFT archive history', 'https://huggingface.co/datasets/Salesforce/GiftEvalPretrain/commits/main'];
  const timestralEvidence = {
    text: 'Mistral pretrained on synthetic series, then trained on real and synthetic series. It gives no end date for the real observations used in that final stage.',
    sources: [['Training report, §4.1', 'https://arxiv.org/html/2610.37585v1#S4.SS1']]
  };
  const models = {
    'chronos-2': {
      corpusBound: '2024-11-10', corpusBoundSource: giftHistory[1],
      evidence: {
        text: 'Amazon lists its real training series in Appendix A. Those subsets of Chronos and GIFT were already archived by 10 November 2024. Amazon gives no single last-observation date.',
        sources: [['Training report', 'https://arxiv.org/html/2510.15821v1#S4'], ['Chronos archive history', 'https://huggingface.co/datasets/autogluon/chronos_datasets/commits/main'], giftHistory]
      },
      date: '2025-10-20', source: 'https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting',
      weightsDate: '2025-10-30', weightSource: 'https://huggingface.co/amazon/chronos-2/commit/95a9710e2596287d08352589f42634fa5abdf0a7'
    },
    'tirex-2': {
      evidence: {
        text: 'We tested the base checkpoint. The report describes pretraining and long-context post-training. Its dataset inventories for benchmark-specific variants do not establish the last observation used for the base checkpoint.',
        sources: [['Training report', 'https://arxiv.org/html/2607.01204v1#A5'], ['Checkpoint variants', 'https://huggingface.co/NX-AI/TiRex-2#other-versions']]
      },
      date: '2026-07-02', source: 'https://nx-ai.github.io/tirex-2/changelog/#011-2026-07-02',
      weightsDate: '2026-07-02', weightSource: 'https://huggingface.co/NX-AI/TiRex-2/commit/f500c26e895ab64283fa38477e073c3088e50ceb'
    },
    'timesfm-3.0-pytorch': {
      corpusBound: '2024-11-10', corpusBoundSource: giftHistory[1],
      evidence: {
        text: 'Google lists Wikipedia pageviews through November 2023, Google Trends through 2022 and GIFT‑Eval Pretrain, last updated with data on 10 November 2024. Google also reports synthetic and augmented series. It gives no separate source dates for augmentation or final model-wide cut-off. We found no additional real dataset named for this checkpoint.',
        sources: [['Google model card', 'https://huggingface.co/google/timesfm-3.0-pytorch#data'], giftHistory, ['Google Research release', 'https://research.google/blog/timesfm-3-a-zero-shot-foundation-model-for-multivariate-forecasting/']]
      },
      date: '2026-08-28', source: 'https://github.com/google-research/timesfm/releases/tag/v3.0.0',
      weightsDate: '2026-08-24', weightSource: 'https://huggingface.co/google/timesfm-3.0-pytorch/commit/6455822fd4703713f3bf9cb2845f7ba51dc65250'
    },
    'tabpfn_3_5': {
      evidence: {
        text: 'Prior Labs reports entirely synthetic pretraining for the tested regressor. There is no calendar cut-off for real training observations. Our retrospective scoring still uses the weight date and caps exposure at Medium.',
        sources: [['Training data and priors', 'https://huggingface.co/Prior-Labs/tabpfn_3_5#training-data-and-priors']]
      },
      date: '2026-09-15', source: 'https://priorlabs.ai/technical-reports/tabpfn-3-5',
      weightsDate: '2026-09-09', weightSource: 'https://huggingface.co/Prior-Labs/tabpfn_3_5/commit/b0662010dd17679509f42326e2f9ba37a6f58818',
      synthetic: true
    },
    't0-gamma': {
      evidence: {
        text: 'The publisher describes the gamma release and refers to its beta report for the architecture. Neither the gamma announcement nor its model card gives an end date for gamma’s training data.',
        sources: [['Gamma announcement', 'https://www.theforecastingcompany.com/blog/t0-gamma/'], ['Gamma model card', 'https://huggingface.co/theforecastingcompany/t0-gamma']]
      },
      date: '2026-10-13', source: 'https://www.theforecastingcompany.com/blog/t0-gamma/',
      weightsDate: '2026-10-15', weightSource: 'https://huggingface.co/theforecastingcompany/t0-gamma/commit/e08aee083778f1f32da4974c0a34276776a35c52'
    },
    'timestral-28m': {
      evidence: timestralEvidence,
      date: '2026-10-15', source: 'https://mistral.ai/news/timestral/',
      weightsDate: '2026-10-15', weightSource: 'https://huggingface.co/mistralai/Timestral-28M/commit/2554d703c2c46144e20390e86721e8e9f7bbd910'
    },
    'timestral-209m': {
      evidence: timestralEvidence,
      date: '2026-10-15', source: 'https://mistral.ai/news/timestral/',
      weightsDate: '2026-10-15', weightSource: 'https://huggingface.co/mistralai/Timestral-209M/commit/7394bc19c4b48dfb9c0872689eed058d3216331a'
    },
    'ci-proto': {
      evidence: {
        text: 'The tested XL checkpoint received additional training on real energy, transport, environmental and economic series. The authors give no end dates for those series.',
        sources: [['Training report, Appendix B.2', 'https://arxiv.org/html/2611.16934v1#A2.SS2']]
      },
      date: '2026-11-12', source: 'https://www.continuousintelligence.co.uk/news/ci-proto/',
      weightsDate: '2026-11-11', weightSource: 'https://huggingface.co/ContinuousIntelligence/ci-proto/commit/350720e2dae262610ec6abb541177987d26f3347'
    }
  };
  const dateLabel = new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'});
  const formatDate = iso => dateLabel.format(new Date(iso + 'T00:00:00Z'));

  const labels = {none:'None', medium:'Medium', high:'High'};
  const formatPercent = new Intl.NumberFormat('en-GB', {style:'percent', maximumFractionDigits:2});
  const dayMs = 24 * 60 * 60 * 1000;

  function exposureSource(model) {
    if (model?.trainingCutoff) {
      return {date:model.trainingCutoff, label:'Published training cut-off', url:model.trainingCutoffSource};
    }
    if (model?.corpusBound) {
      return {date:model.corpusBound, label:'Archive estimate', url:model.corpusBoundSource};
    }
    if (model?.weightsDate) {
      return {date:model.weightsDate, label:'Tested weights', url:model.weightSource};
    }
    return null;
  }

  function assessment(id, period, market) {
    const model = models[id];
    const scope = period?.scopes?.[market];
    if (!scope?.days || !model) return null;

    // Use the strongest dated evidence accepted for this checkpoint.
    const cutoff = exposureSource(model)?.date;
    if (!cutoff) return null;
    const total = scope.days;
    const aboveThreshold = model.synthetic ? 'medium' : 'high';
    if (cutoff < period.start) return {cutoff, total, level:'none'};
    if (cutoff > period.end) return {cutoff, total, before:total, level:aboveThreshold};

    const elapsed = (Date.parse(cutoff) - Date.parse(period.start)) / dayMs;
    let minBefore, maxBefore;
    if (Array.isArray(scope.unscoredDates)) {
      minBefore = maxBefore = elapsed - scope.unscoredDates.filter(date => date < cutoff).length;
    } else {
      // Older exports give the count of scored days without naming the gaps.
      // Classify only when every possible placement of the gaps gives the same level.
      const span = (Date.parse(period.end) - Date.parse(period.start)) / dayMs + 1;
      minBefore = Math.max(0, elapsed - (span - total));
      maxBefore = Math.min(elapsed, total);
    }
    if (!model.synthetic && minBefore * 100 <= total * 15 && maxBefore * 100 > total * 15) return null;
    const level = maxBefore * 100 <= total * 15 ? 'medium' : aboveThreshold;
    return {cutoff, total, before:minBefore === maxBefore ? minBefore : null, level};
  }

  function category(id, period, market) {
    return assessment(id, period, market)?.level ?? null;
  }

  function description(level) {
    if (level === 'none') return 'No training exposure';
    return labels[level] ? labels[level] + ' training exposure' : 'Training exposure unavailable';
  }

  function note(id, period, market) {
    const result = assessment(id, period, market);
    if (!result) return '';
    const {cutoff, before, total, level} = result;
    const model = models[id];
    let dateNote = 'Weights dated ' + formatDate(cutoff) + '.';
    if (model.trainingCutoff) dateNote = 'Published training cut-off ' + formatDate(cutoff) + '.';
    else if (model.corpusBound) dateNote = 'Named real training data archived by ' + formatDate(cutoff) + ' (estimated upper bound).';
    let details;
    if (level === 'none') {
      details = 'The scoring period starts after that date.';
    } else if (before === null) {
      details = model.synthetic ? 'This window includes the period before the weights were fixed.'
        : (level === 'medium' ? 'At most' : 'More than') + ' 15% of scored days fall before that date.';
    } else {
      details = before + ' of ' + total + ' scored days (' + formatPercent.format(before / total) + ') fall before that date.';
    }
    const training = model.synthetic ? (level === 'medium'
      ? ' Prior Labs reports entirely synthetic pretraining, so the benchmark caps exposure at Medium.'
      : ' Prior Labs reports entirely synthetic pretraining.') : '';
    return dateNote + ' ' + details + training;
  }

  function rankEligible(level) {
    return level === 'none' || level === 'medium';
  }

  function eligibleRanks(points, period, market) {
    const eligible = Object.entries(points ?? {}).filter(([id, point]) => {
      const level = category(id, period, market);
      return rankEligible(level) && Number.isFinite(point?.compositeRank);
    }).sort((a,b) => a[1].compositeRank - b[1].compositeRank);
    const ranks = new Map();
    let lastRank, rank;
    eligible.forEach(([id, point], index) => {
      if (point.compositeRank !== lastRank) rank = index + 1;
      ranks.set(id, rank);
      lastRank = point.compositeRank;
    });
    return ranks;
  }

  function levelLabel(id, period, market) {
    const level = category(id, period, market);
    const label = document.createElement('span');
    label.className = 'epf-exposure-level';
    label.dataset.exposure = level ?? 'unknown';
    label.textContent = labels[level] ?? 'Unknown';
    label.title = note(id, period, market) || description(level);
    return label;
  }

  window.EPFReleases = {models, formatDate, exposureSource, category, labels, description, note, rankEligible, eligibleRanks, levelLabel};
})();
