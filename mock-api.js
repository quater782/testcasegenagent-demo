(function () {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const nowIso = () => new Date().toISOString();
  const json = (payload, status = 200) => Promise.resolve(new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  }));
  const parseBody = (options) => {
    try { return JSON.parse(options && options.body || "{}"); } catch (_error) { return {}; }
  };

  const registry = {
    schemaVersion: 1,
    defaultProjectId: "atlas-mobile",
    projects: [
      {
        id: "atlas-mobile",
        name: "Atlas Mobile",
        displayName: "Atlas Mobile（Mock）",
        aliases: ["atlas", "mobile"],
        status: "active",
        productLine: "Atlas",
        dataDir: "projects/atlas-mobile",
        zentao: { project: 9001, product: 8001 },
        knowledge: { provider: "dify", enabled: true, apiBase: "", datasetId: "mock-atlas-mobile", topK: 5, scoreThreshold: 0.55 },
        taxonomy: { source: "Mock 基准用例.xlsx" },
        caseConfig: { baselineLibraries: ["mock_baseline"], includeZentaoCases: true, mergeStrategy: "caseCode_then_fingerprint", taxonomyLibrary: "mock_baseline" }
      },
      {
        id: "atlas-core",
        name: "Atlas Core",
        displayName: "Atlas Core（Mock）",
        aliases: ["core"],
        status: "active",
        productLine: "Atlas",
        dataDir: "projects/atlas-core",
        zentao: { project: 9002, product: 8002 },
        knowledge: { provider: "dify", enabled: true, apiBase: "", datasetId: "mock-atlas-core", topK: 5, scoreThreshold: 0.58 },
        taxonomy: { source: "Mock 基准用例.xlsx" },
        caseConfig: { baselineLibraries: ["mock_baseline"], includeZentaoCases: true, mergeStrategy: "caseCode_then_fingerprint", taxonomyLibrary: "mock_baseline" }
      },
      {
        id: "nova-web",
        name: "Nova Web",
        displayName: "Nova Web（Mock）",
        aliases: ["nova"],
        status: "wait",
        productLine: "Atlas",
        dataDir: "projects/nova-web",
        zentao: { project: 9003, product: 8003 },
        knowledge: { provider: "dify", enabled: true, apiBase: "", datasetId: "mock-nova-web", topK: 4, scoreThreshold: 0.62 },
        taxonomy: { source: "Mock 基准用例.xlsx" },
        caseConfig: { baselineLibraries: ["mock_baseline"], includeZentaoCases: true, mergeStrategy: "caseCode_then_fingerprint", taxonomyLibrary: "mock_baseline" }
      },
      {
        id: "orion-legacy",
        name: "Orion Legacy",
        displayName: "Orion Legacy（Mock）",
        aliases: ["orion"],
        status: "wait",
        productLine: "Atlas",
        dataDir: "projects/orion-legacy",
        zentao: { project: 9004, product: 8004 },
        knowledge: { provider: "dify", enabled: true, apiBase: "", datasetId: "mock-orion-legacy", topK: 4, scoreThreshold: 0.6 },
        taxonomy: { source: "Mock 基准用例.xlsx" },
        caseConfig: { baselineLibraries: ["mock_baseline"], includeZentaoCases: true, mergeStrategy: "caseCode_then_fingerprint", taxonomyLibrary: "mock_baseline" }
      }
    ],
    relations: [
      { from: "atlas-mobile", to: "atlas-core", type: "shared_service", relationType: "shared_service", weight: 0.92, description: "共享账号与交易状态协议（Mock）" },
      { from: "orion-legacy", to: "atlas-mobile", type: "generation", relationType: "generation", weight: 0.81, description: "上一代重连策略参考（Mock）" },
      { from: "nova-web", to: "atlas-mobile", type: "same_product_line", relationType: "same_product_line", weight: 0.68, description: "同产品线业务规则参考（Mock）" },
      { from: "atlas-core", to: "nova-web", type: "shared_service", relationType: "shared_service", weight: 0.76, description: "共享消息和订单服务（Mock）" }
    ],
    caseLibraries: [
      { id: "mock_baseline", name: "Mock 回归基准库", source: "demo", enabled: true }
    ],
    relationTypes: ["shared_service", "generation", "same_product_line", "reference"]
  };

  const bugRows = [
    { id: 99001, title: "弱网重连后订单状态偶发回滚（Mock）", severity: "1", status: "resolved", hasInsight: true, actualL1: "交易链路", actualL2: "订单状态", rootCauseType: "并发时序", subModule: "网络重连", imageCount: 2, actionCount: 6 },
    { id: 99002, title: "跨版本升级后登录态提前失效（Mock）", severity: "2", status: "closed", hasInsight: true, actualL1: "账号体系", actualL2: "登录态", rootCauseType: "兼容性遗漏", subModule: "数据迁移", imageCount: 1, actionCount: 4 },
    { id: 99003, title: "消息重试导致同一通知重复展示（Mock）", severity: "2", status: "resolved", hasInsight: true, actualL1: "消息中心", actualL2: "推送", rootCauseType: "幂等缺失", subModule: "消费重试", imageCount: 0, actionCount: 5 },
    { id: 99004, title: "优惠叠加时结算金额出现负数（Mock）", severity: "1", status: "closed", hasInsight: true, actualL1: "交易链路", actualL2: "计价", rootCauseType: "边界遗漏", subModule: "优惠规则", imageCount: 1, actionCount: 7 },
    { id: 99005, title: "离线恢复后草稿内容被旧版本覆盖（Mock）", severity: "3", status: "resolved", hasInsight: true, actualL1: "数据同步", actualL2: "离线编辑", rootCauseType: "版本冲突", subModule: "草稿同步", imageCount: 0, actionCount: 3 },
    { id: 99006, title: "批量导出在空结果时持续加载（Mock）", severity: "3", status: "closed", hasInsight: true, actualL1: "工具能力", actualL2: "批量导出", rootCauseType: "终态遗漏", subModule: "异步任务", imageCount: 0, actionCount: 2 }
  ];

  const caseRows = [
    { caseKey: "mock:case:1084", caseId: 91084, caseCode: "CASE-MOCK-1084", title: "弱网切换下订单状态最终一致性", sourceType: "merged", pri: "P0", scenario: "交易链路 › 订单状态", testType: "功能", stepCount: 4 },
    { caseKey: "mock:case:1127", caseId: 91127, caseCode: "CASE-MOCK-1127", title: "前后台切换期间重连回调顺序", sourceType: "zentao", pri: "P0", scenario: "网络能力 › 重连", testType: "可靠性", stepCount: 5 },
    { caseKey: "mock:case:0836", caseId: 90836, caseCode: "CASE-MOCK-0836", title: "重复回调下状态写入幂等性", sourceType: "merged", pri: "P1", scenario: "交易链路 › 状态机", testType: "功能", stepCount: 4 },
    { caseKey: "mock:case:0942", caseId: 90942, caseCode: "CASE-MOCK-0942", title: "Wi-Fi 与移动网络快速切换恢复", sourceType: "baseline", pri: "P1", scenario: "网络能力 › 弱网", testType: "可靠性", stepCount: 5 },
    { caseKey: "mock:case:0761", caseId: 90761, caseCode: "CASE-MOCK-0761", title: "本地缓存版本号冲突处理", sourceType: "merged", pri: "P1", scenario: "数据同步 › 缓存", testType: "异常", stepCount: 4 }
  ];

  const steps = (title) => [
    { index: 1, step: `准备 ${title} 的 Mock 前置条件`, expect: "环境与初始状态正确" },
    { index: 2, step: "触发目标修改路径并记录关键状态", expect: "状态变化与设计一致" },
    { index: 3, step: "在关键窗口切换网络或应用前后台", expect: "不出现旧状态覆盖或重复回调" },
    { index: 4, step: "恢复稳定网络并重新进入页面", expect: "最终状态一致且可追溯" }
  ];

  const insights = {
    99001: {
      ok: true,
      model: "Mock Reasoning Model",
      insight: {
        problemSummary: "重连期间旧回调晚于新状态落盘，导致订单状态被回写。",
        actualCategory: { l1: "交易链路", l2: "订单状态", l3: "状态一致性", confidence: 0.97, valid: true },
        rootCauseType: "并发时序",
        rootCauseSummary: "重试回调与本地缓存并发写入，缺少版本戳保护。",
        fixActionType: "状态机收敛",
        fixSummary: "增加状态版本戳，并将重试回调收敛到串行队列。",
        affectedModules: ["网络重连", "订单状态", "本地缓存"],
        symptomTags: ["弱网", "状态回滚", "偶现"],
        conditionTags: ["网络切换", "前后台切换", "重复回调"],
        componentTags: ["RetryQueue", "LocalCache", "OrderState"],
        recommendedTests: [
          { point: "弱网切换下最终一致性", reason: "直接覆盖本次竞态窗口" },
          { point: "重复回调幂等校验", reason: "验证版本戳不会允许旧写入" },
          { point: "进程中断后的冷启动恢复", reason: "补充现有用例库盲点" }
        ],
        regressionRisks: ["旧版重连退避策略与新队列组合风险", "本地写入失败后的半成功状态"],
        relatedHints: ["network.reconnect", "order.state", "cache.version"],
        worthChecklist: { value: true, reason: "具有可复用的并发状态机回归价值" },
        confidence: 0.97
      }
    }
  };

  function bugDetail(id) {
    const row = bugRows.find((item) => item.id === Number(id)) || bugRows[0];
    const insight = insights[row.id] || {
      ok: true,
      model: "Mock Fast Model",
      insight: {
        problemSummary: row.title,
        actualCategory: { l1: row.actualL1, l2: row.actualL2, l3: row.subModule, confidence: 0.91, valid: true },
        rootCauseType: row.rootCauseType,
        rootCauseSummary: "Mock 根因：异常分支缺少统一状态保护。",
        fixActionType: "逻辑修复",
        fixSummary: "收敛状态并增加兼容与幂等处理。",
        affectedModules: [row.subModule],
        symptomTags: ["异常状态", "偶现"],
        conditionTags: ["边界条件"],
        componentTags: [row.actualL2],
        recommendedTests: [{ point: "主流程回归", reason: "验证修复路径" }, { point: "异常分支", reason: "覆盖历史风险" }],
        regressionRisks: ["相邻模块状态同步"],
        relatedHints: [row.rootCauseType],
        worthChecklist: { value: true, reason: "可复用 Mock 经验" },
        confidence: 0.91
      }
    };
    const related = caseRows.slice(0, row.id === 99001 ? 3 : 2).map((item, index) => ({
      ...item,
      linkType: index < 2 ? "bug.case" : "case.fromBug",
      moduleL1: item.scenario.split(" › ")[0],
      moduleL2: item.scenario.split(" › ")[1],
      type: item.testType,
      status: "normal",
      precondition: "使用 Mock 测试环境，数据状态已初始化。",
      steps: steps(item.title)
    }));
    return {
      cleaned: {
        id: row.id,
        title: row.title,
        severity: row.severity,
        type: "codeerror",
        status: row.status,
        resolution: "fixed",
        module: row.actualL1,
        subModule: row.subModule,
        resolvedByName: "Mock Developer",
        resolvedDate: "2026-07-28 15:20",
        stepsText: "1. 在弱网环境提交订单\n2. 快速切换网络\n3. 返回应用查看订单状态",
        business: {
          "关闭类型": { value: "已修复" },
          "所属子模块": { value: row.subModule },
          "故障标签": { value: row.rootCauseType },
          "设备型号": { value: "Mock Device" },
          "问题概率": { value: "偶现" },
          "是否可恢复": { value: "是" },
          "问题原因": { value: insight.insight.rootCauseSummary },
          "改善方案": { value: insight.insight.fixSummary },
          "测试影响": { value: "重连、状态同步与本地缓存" }
        },
        relations: { duplicateBug: "", relatedBug: "MOCK-99005", case: related.map((item) => item.caseId).join(",") },
        relatedCases: related,
        timeline: [
          { date: "2026-07-25 10:08", actorName: "Mock Tester", actionLabel: "创建缺陷", commentText: "弱网重连后状态偶发回滚。", changes: [] },
          { date: "2026-07-27 16:42", actorName: "Mock Developer", actionLabel: "确认根因", commentText: "定位到回调与缓存并发写入。", changes: [] },
          { date: "2026-07-28 15:20", actorName: "Mock Tester", actionLabel: "验证通过", commentText: "主路径和历史关联用例通过。", changes: [] }
        ]
      },
      images: [],
      insight
    };
  }

  function caseDetail(key) {
    const normalized = decodeURIComponent(String(key || ""));
    const row = caseRows.find((item) => item.caseKey === normalized || String(item.caseId) === normalized) || caseRows[0];
    return {
      case: {
        ...row,
        type: "existing",
        status: "normal",
        category: { l1: row.scenario.split(" › ")[0], l2: row.scenario.split(" › ")[1] },
        precondition: "Mock 项目已安装，网络代理可切换在线与弱网。",
        steps: steps(row.title),
        sourceRefs: [{ kind: "mock", id: row.caseId }]
      },
      relatedBugs: [{ bugId: 99001, bugTitle: bugRows[0].title, linkType: "bug.case", rootCauseType: "并发时序", reason: "该用例曾发现此 Mock 缺陷" }]
    };
  }

  const baseCases = [
    {
      caseRef: "caseKey:mock:case:1084",
      type: "existing",
      caseKey: "mock:case:1084",
      caseId: 91084,
      caseCode: "CASE-MOCK-1084",
      title: "弱网切换下订单状态最终一致性",
      role: "linked_regression",
      recommendationRole: "linked_regression",
      mustRun: true,
      linkType: "bug.case",
      _lockedLinkedRegression: true,
      reason: "该用例与 BUG-MOCK-99001 直接关联，修复后必须回归。",
      precondition: "Mock 账号存在一笔可更新状态的订单。",
      steps: steps("弱网切换下订单状态最终一致性"),
      evidence: [{ kind: "bug", bugId: 99001, title: "Mock 直接关联", url: "#" }]
    },
    {
      caseRef: "caseKey:mock:case:1127",
      type: "existing",
      caseKey: "mock:case:1127",
      caseId: 91127,
      caseCode: "CASE-MOCK-1127",
      title: "前后台切换期间重连回调顺序",
      role: "linked_regression",
      recommendationRole: "linked_regression",
      mustRun: true,
      linkType: "bug.case",
      _lockedLinkedRegression: true,
      reason: "覆盖与本次修复相同的生命周期竞态窗口。",
      precondition: "订单状态更新中，应用允许切换至后台。",
      steps: steps("前后台切换期间重连回调顺序"),
      evidence: [{ kind: "bug", bugId: 99001, title: "Mock 直接关联", url: "#" }]
    },
    {
      caseRef: "caseKey:mock:case:0836",
      type: "existing",
      caseKey: "mock:case:0836",
      caseId: 90836,
      caseCode: "CASE-MOCK-0836",
      title: "重复回调下状态写入幂等性",
      reason: "修复加入版本戳，需要验证旧事件不会覆盖新状态。",
      precondition: "可以注入重复的 Mock 回调事件。",
      steps: steps("重复回调下状态写入幂等性"),
      evidence: [{ kind: "case", caseKey: "mock:case:0836", title: "同模块检索", url: "#" }]
    },
    {
      caseRef: "caseKey:mock:case:0942",
      type: "existing",
      caseKey: "mock:case:0942",
      caseId: 90942,
      caseCode: "CASE-MOCK-0942",
      title: "Wi-Fi 与移动网络快速切换恢复",
      reason: "同属 network.reconnect 功能切片，覆盖连续重试与网络抖动。",
      precondition: "Mock 网络代理支持快速切换。",
      steps: steps("Wi-Fi 与移动网络快速切换恢复"),
      evidence: [{ kind: "case", caseKey: "mock:case:0942", title: "向量检索 0.87", url: "#" }]
    },
    {
      caseRef: "caseKey:mock:case:0761",
      type: "existing",
      caseKey: "mock:case:0761",
      caseId: 90761,
      caseCode: "CASE-MOCK-0761",
      title: "本地缓存版本号冲突处理",
      reason: "历史相似根因表明缓存版本冲突会造成同类旧状态覆盖。",
      precondition: "可修改本地 Mock 缓存版本。",
      steps: steps("本地缓存版本号冲突处理"),
      evidence: [{ kind: "bug", bugId: 99005, title: "Mock 历史相似缺陷", url: "#" }]
    },
    {
      caseRef: "generatedCaseId:NEW-MOCK-014",
      generatedCaseId: "NEW-MOCK-014",
      type: "generated",
      title: "新增建议：回调乱序与进程中断组合恢复",
      reason: "现有用例库未覆盖写入中断后的冷启动恢复，是本次分析识别出的盲点。",
      precondition: "可在状态写入阶段结束 Mock 进程。",
      steps: steps("回调乱序与进程中断组合恢复"),
      evidence: [{ kind: "knowledge", chunkId: "MOCK-CHUNK-17", title: "功能设计参考", url: "#" }]
    },
    {
      caseRef: "generatedCaseId:NEW-MOCK-015",
      generatedCaseId: "NEW-MOCK-015",
      type: "generated",
      title: "新增建议：连续三次重连后的最终状态收敛",
      reason: "多次重试会放大回调乱序风险，需要验证版本戳始终单调递增。",
      precondition: "可连续触发三轮 Mock 弱网重连。",
      steps: steps("连续三次重连后的最终状态收敛"),
      evidence: [{ kind: "knowledge", chunkId: "MOCK-CHUNK-23", title: "重试策略设计", url: "#" }]
    },
    {
      caseRef: "generatedCaseId:NEW-MOCK-016",
      generatedCaseId: "NEW-MOCK-016",
      type: "generated",
      title: "新增建议：多端同时更新订单状态的冲突合并",
      reason: "状态版本戳改动可能影响多端写入，需要验证服务端与本地缓存的冲突优先级。",
      precondition: "两个 Mock 客户端登录同一测试账号。",
      steps: steps("多端同时更新订单状态的冲突合并"),
      evidence: [{ kind: "bug", bugId: 99005, title: "历史版本冲突缺陷", url: "#" }]
    },
    {
      caseRef: "generatedCaseId:NEW-MOCK-017",
      generatedCaseId: "NEW-MOCK-017",
      type: "generated",
      title: "新增建议：重连过程中退出账号的数据隔离",
      reason: "异步回调可能在账号切换后返回，必须阻止旧账号状态写入新会话。",
      precondition: "Mock 账号 A 与账号 B 均存在订单。",
      steps: steps("重连过程中退出账号的数据隔离"),
      evidence: [{ kind: "knowledge", chunkId: "MOCK-CHUNK-31", title: "账号隔离规范", url: "#" }]
    },
    {
      caseRef: "generatedCaseId:NEW-MOCK-018",
      generatedCaseId: "NEW-MOCK-018",
      type: "generated",
      title: "新增建议：低电量后台冻结后的重连恢复",
      reason: "系统冻结会改变回调到达时序，是现有回归库中的覆盖盲点。",
      precondition: "Mock 设备开启低电量模式并允许后台冻结。",
      steps: steps("低电量后台冻结后的重连恢复"),
      evidence: [{ kind: "knowledge", chunkId: "MOCK-CHUNK-38", title: "移动端生命周期规范", url: "#" }]
    }
  ];

  function artifactFor(workItems, count = baseCases.length) {
    const cases = baseCases.slice(0, count);
    const rows = workItems.map((item, index) => {
      const refs = cases[index] ? [cases[index].caseRef] : [];
      return {
        workItemId: item.workItemId,
        order: index + 1,
        displayName: item.displayName,
        rawInput: item.rawInput,
        status: count >= baseCases.length ? "succeeded" : "running",
        resultState: count >= baseCases.length ? "completed_with_cases" : "running",
        caseIds: refs,
        caseCount: refs.length,
        recommendReason: index < 2
          ? "该输入命中明确的 Bug-Case 关联，优先复用已有必回归用例。"
          : "该输入由对应子 Agent 独立检索，未命中现有覆盖时生成一条可执行用例。",
        rationale: index < 2
          ? "系统锁定与当前修改直接关联的历史用例，并保留缺陷证据。"
          : "按用户确认的口径，已有用例优先；覆盖不足时才生成新用例并保留推荐依据。"
      };
    });
    const index = {};
    rows.forEach((row) => row.caseIds.forEach((ref) => {
      if (!index[ref]) index[ref] = [];
      if (!index[ref].includes(row.workItemId)) index[ref].push(row.workItemId);
    }));
    return {
      artifactId: "ART-MOCK-0729",
      status: count >= baseCases.length ? "completed" : "running",
      recommendedCases: cases,
      recommendationsByWorkItem: rows,
      caseWorkItemIndex: index,
      summary: `${rows.length} 个修改点，共 ${cases.length} 条唯一推荐用例。`
    };
  }

  const defaultWorkItems = [
    { workItemId: "WI-MOCK-01", order: 1, displayName: "弱网重连后订单状态回滚", rawInput: "修改点 01｜BUG-99001｜弱网重连后订单状态不可被旧回调覆盖｜P0" },
    { workItemId: "WI-MOCK-02", order: 2, displayName: "前后台切换回调顺序", rawInput: "修改点 02｜应用前后台切换期间保证重连回调顺序｜P0" },
    { workItemId: "WI-MOCK-03", order: 3, displayName: "重复回调幂等处理", rawInput: "修改点 03｜重复回调只允许写入一次最新状态｜P1" },
    { workItemId: "WI-MOCK-04", order: 4, displayName: "网络快速切换恢复", rawInput: "修改点 04｜Wi-Fi 与移动网络快速切换后恢复同步｜P1" },
    { workItemId: "WI-MOCK-05", order: 5, displayName: "本地缓存版本冲突", rawInput: "修改点 05｜缓存版本冲突时以最新版本为准｜P1" },
    { workItemId: "WI-MOCK-06", order: 6, displayName: "进程中断冷启动恢复", rawInput: "修改点 06｜写入过程中结束进程，冷启动后继续恢复｜P1" },
    { workItemId: "WI-MOCK-07", order: 7, displayName: "连续重连状态收敛", rawInput: "修改点 07｜连续三次重连后订单状态最终一致｜P1" },
    { workItemId: "WI-MOCK-08", order: 8, displayName: "多端写入冲突合并", rawInput: "修改点 08｜两个客户端同时更新时正确合并冲突｜P1" },
    { workItemId: "WI-MOCK-09", order: 9, displayName: "账号切换数据隔离", rawInput: "修改点 09｜重连过程中切换账号不得串写数据｜P0" },
    { workItemId: "WI-MOCK-10", order: 10, displayName: "低电量后台冻结恢复", rawInput: "修改点 10｜低电量后台冻结后重新进入可恢复｜P2" }
  ];
  const textDemoPrompt = `本次版本有 10 个修改点，请分别推荐回归用例：\n${defaultWorkItems.map((item) => `${item.order}. ${item.displayName}`).join("\n")}`;

  const agentTaskTemplates = [
    { name: "Bug 关联检索 Agent", tool: "search_bug_case_pairs", note: "检索缺陷与历史用例的直接关联" },
    { name: "同模块用例检索 Agent", tool: "search_cases", note: "按模块、标签与测试类型召回已有用例" },
    { name: "语义召回 Agent", tool: "vector_search", note: "使用向量相似度补充语义相关覆盖" },
    { name: "项目知识检索 Agent", tool: "dify_search", note: "读取设计说明与已审批团队经验" },
    { name: "跨项目关系 Agent", tool: "list_related_projects", note: "沿项目关系图寻找可解释的历史风险" },
    { name: "历史缺陷检索 Agent", tool: "search_history", note: "查找相似根因与复发模式" },
    { name: "边界风险分析 Agent", tool: "risk_analysis", note: "识别弱网、生命周期与并发组合边界" },
    { name: "用例生成 Agent", tool: "generate_cases", note: "把未覆盖风险转为可执行步骤" },
    { name: "覆盖去重 Agent", tool: "dedupe_cases", note: "合并重复用例并保留证据链" },
    { name: "结果编排 Agent", tool: "build_workbook", note: "整理输入项、推荐理由与最终用例清单" }
  ];

  const excelWorkItems = [
    { workItemId: "WI-XLS-01", order: 1, displayName: "弱网重连状态回滚", rawInput: "Excel 第 2 行｜BUG-99001｜弱网重连状态回滚｜P0" },
    { workItemId: "WI-XLS-02", order: 2, displayName: "前后台切换回调乱序", rawInput: "Excel 第 3 行｜生命周期切换期间回调乱序｜P0" },
    { workItemId: "WI-XLS-03", order: 3, displayName: "重复回调幂等处理", rawInput: "Excel 第 4 行｜重复回调不得覆盖新状态｜P1" },
    { workItemId: "WI-XLS-04", order: 4, displayName: "多端写入冲突", rawInput: "Excel 第 5 行｜两个客户端同时更新订单状态｜P1" },
    { workItemId: "WI-XLS-05", order: 5, displayName: "账号切换数据隔离", rawInput: "Excel 第 6 行｜重连中退出并切换账号｜P0" },
    { workItemId: "WI-XLS-06", order: 6, displayName: "进程中断冷启动恢复", rawInput: "Excel 第 7 行｜写入阶段结束进程后恢复｜P1" },
    { workItemId: "WI-XLS-07", order: 7, displayName: "连续重试状态收敛", rawInput: "Excel 第 8 行｜连续三轮重连后的最终一致性｜P1" },
    { workItemId: "WI-XLS-08", order: 8, displayName: "低电量后台冻结", rawInput: "Excel 第 9 行｜低电量模式下后台冻结并恢复｜P2" },
    { workItemId: "WI-XLS-09", order: 9, displayName: "网络切换恢复", rawInput: "Excel 第 10 行｜Wi-Fi 与移动网络快速切换｜P1" },
    { workItemId: "WI-XLS-10", order: 10, displayName: "缓存版本冲突", rawInput: "Excel 第 11 行｜本地缓存版本冲突处理｜P1" }
  ];

  function makeExecution(status = "completed", progress = agentTaskTemplates.length, workItems = defaultWorkItems, scenario = "text", executionId = "EXEC-MOCK-READY", statusOverride = null) {
    const taskStatuses = Array.isArray(statusOverride) && statusOverride.length === agentTaskTemplates.length
      ? statusOverride
      : agentTaskTemplates.map((_, index) => {
        if (status === "completed") return "succeeded";
        if (index < progress) return "succeeded";
        if (index < progress + 3) return "running";
        return "pending";
      });
    return {
      executionId,
      turnId: "TURN-MOCK-02",
      status,
      reason: "recommend",
      scenario,
      tasks: agentTaskTemplates.map((template, index) => ({
        taskId: `${executionId}-TASK-${String(index + 1).padStart(2, "0")}`,
        resultRef: `${executionId}-RESULT-${String(index + 1).padStart(2, "0")}`,
        workItemId: workItems[index % workItems.length].workItemId,
        order: index + 1,
        batchIndex: Math.floor(index / 5) + 1,
        status: taskStatuses[index],
        agentName: index === 9 && scenario === "excel" ? "Excel 结果编排 Agent" : template.name,
        displayName: index === 9 && scenario === "excel" ? "Excel 结果编排 Agent" : template.name,
        tool: template.tool,
        note: index === 9 && scenario === "excel" ? "整理 Excel 输入行、推荐理由与最终用例清单" : template.note,
        rawInput: workItems[index % workItems.length].rawInput,
        model: { displayName: index < 7 ? "Mock Fast" : "Mock Reasoning", modelName: index < 7 ? "mock-fast-v2" : "mock-reasoning-v1", slot: index % 3 + 1 },
        updatedAt: nowIso()
      }))
    };
  }

  function workerResultsFor(execution, artifact) {
    const cases = artifact.recommendedCases || [];
    const workerResults = {};
    (execution.tasks || []).forEach((task, index) => {
      workerResults[task.resultRef] = {
        status: task.status === "succeeded" ? "succeeded" : "running",
        model: task.model,
        thoughtCard: {
          summary: task.note,
          steps: [
            { step: 1, tool: task.tool, thought: task.note, resultSummary: index < cases.length ? `命中：${cases[index].title}` : "已完成本子任务的结构化分析" }
          ]
        },
        rationale: task.note,
        recommendedCases: cases.length ? [cases[index % cases.length]] : []
      };
    });
    return workerResults;
  }

  function finishedStatus(conversation) {
    const artifact = artifactFor(defaultWorkItems);
    const execution = makeExecution("completed", agentTaskTemplates.length, defaultWorkItems, "text", "EXEC-MOCK-READY");
    const workerResults = workerResultsFor(execution, artifact);
    return {
      conversation: { ...conversation, status: "completed" },
      messages: [
        { messageId: "MSG-MOCK-01", role: "user", type: "chat", content: textDemoPrompt, createdAt: "2026-07-29 14:01" },
        { messageId: "MSG-MOCK-02", role: "assistant", type: "chat", content: "收到 10 个修改点。派发前确认一个推荐口径：优先复用已有用例，只有未覆盖的风险才生成新用例，对吗？", createdAt: "2026-07-29 14:01" },
        { messageId: "MSG-MOCK-03", role: "user", type: "chat", content: "对，已有用例优先；未覆盖的风险再生成新用例，并保留推荐依据。", createdAt: "2026-07-29 14:02" },
        { messageId: "MSG-MOCK-DISPATCH", role: "assistant", type: "chat", content: "收到。我保留你的约束并负责后续沟通；检索、风险分析和用例推荐已拆成 10 个子任务，交给子 Agent 并行执行。", createdAt: "2026-07-29 14:02" },
        { messageId: "MSG-MOCK-04", role: "assistant", type: "execution", content: "", executionId: execution.executionId, status: execution.status, createdAt: "2026-07-29 14:02" },
        { messageId: "MSG-MOCK-05", role: "assistant", type: "chat", content: "子 Agent 已完成汇总：锁定 2 条 Bug 关联必回归用例，并补充同模块、历史风险与 5 个新增盲点。你可以继续问我推荐依据、范围取舍或执行优先级。", createdAt: "2026-07-29 14:03" }
      ],
      activeArtifact: artifact,
      lastSeq: 24,
      runContext: {
        workItems: defaultWorkItems,
        executions: { [execution.executionId]: execution },
        latestExecutionId: execution.executionId,
        activeExecutionId: "",
        activeTurnId: "",
        executionStatus: "completed",
        activeArtifact: artifact,
        currentResultView: artifact,
        workerResults,
        latestWorkerResultByWorkItem: {},
        lastEventAt: nowIso()
      }
    };
  }

  const conversations = new Map();
  const readyConversation = {
    conversationId: "CONV-MOCK-READY",
    title: "10项版本回归分析（完整示例）",
    updatedAt: "2026-07-29T14:03:00+08:00",
    mode: "auto",
    messageCount: 6,
    latestMessagePreview: "10 个子 Agent 已完成推荐",
    hidden: false,
    phase: 2
  };
  conversations.set(readyConversation.conversationId, {
    conversation: readyConversation,
    status: finishedStatus(readyConversation),
    feedback: {},
    timers: []
  });

  let conversationSerial = 1;
  let executionSerial = 1;
  let nextConversationScenario = "text";
  const eventSources = new Set();
  class MockEventSource {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      this.closed = false;
      eventSources.add(this);
      setTimeout(() => {
        if (typeof this.onopen === "function" && !this.closed) this.onopen(new Event("open"));
      }, 20);
    }
    addEventListener(name, callback) {
      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push(callback);
    }
    close() {
      this.closed = true;
      eventSources.delete(this);
    }
    emit(name, data) {
      if (this.closed) return;
      const event = new MessageEvent(name, { data: JSON.stringify(data) });
      (this.listeners[name] || []).forEach((callback) => callback(event));
    }
  }
  window.EventSource = MockEventSource;

  let eventSeq = 30;
  function emitRuntime(conversationId, type, payload = {}) {
    eventSeq += 1;
    const event = { seq: eventSeq, type, payload, createdAt: nowIso() };
    if (payload.taskId) event.taskId = payload.taskId;
    if (payload.turnId) event.turnId = payload.turnId;
    eventSources.forEach((source) => {
      if (source.url.includes(encodeURIComponent(conversationId))) source.emit("runtime", event);
    });
  }

  let turnSerial = 2;
  function scheduleFor(record, delay, callback) {
    const timer = setTimeout(callback, delay);
    record.timers.push(timer);
    return timer;
  }

  function beginMainTurn(record, options = {}) {
    turnSerial += 1;
    const conversationId = record.conversation.conversationId;
    const turnId = `TURN-MOCK-MAIN-${String(turnSerial).padStart(3, "0")}`;
    const answer = String(options.answer || "");
    const thought = String(options.thought || "Thought｜正在理解用户意图并整理下一步。");
    const secondThought = String(options.secondThought || "");
    const tool = String(options.tool || "conversation_memory");
    const action = String(options.action || "Action｜读取当前会话约束");
    const observation = String(options.observation || "Observation｜已取得完成回复所需的信息");
    const answerStart = Number(options.answerStart || 2350);
    const charDelay = Number(options.charDelay || 42);
    const chars = Array.from(answer);

    record.status.runContext = record.status.runContext || {};
    record.status.runContext.activeTurnId = turnId;
    record.status.runContext.lastEventAt = nowIso();
    record.status.conversation.status = "running";
    record.conversation.updatedAt = nowIso();

    scheduleFor(record, 120, () => {
      emitRuntime(conversationId, "main_loop_progress", {
        turnId,
        step: 1,
        maxSteps: secondThought ? 2 : 1,
        remaining: secondThought ? 1 : 0
      });
    });
    scheduleFor(record, 340, () => {
      emitRuntime(conversationId, "main_reasoning_delta", {
        turnId,
        phase: "main_loop",
        text: thought,
        delta: thought
      });
    });
    scheduleFor(record, 900, () => {
      emitRuntime(conversationId, "main_tool_event", {
        turnId,
        name: tool,
        status: "running",
        detail: action
      });
    });
    scheduleFor(record, 1580, () => {
      emitRuntime(conversationId, "main_tool_event", {
        turnId,
        name: tool,
        status: "completed",
        detail: observation
      });
    });
    if (secondThought) {
      scheduleFor(record, 1880, () => {
        emitRuntime(conversationId, "main_loop_progress", {
          turnId,
          step: 2,
          maxSteps: 2,
          remaining: 0
        });
        emitRuntime(conversationId, "main_reasoning_delta", {
          turnId,
          phase: "main_loop",
          text: secondThought,
          delta: secondThought
        });
      });
    }

    chars.forEach((char, index) => {
      scheduleFor(record, answerStart + index * charDelay, () => {
        emitRuntime(conversationId, "main_answer_delta", {
          turnId,
          text: chars.slice(0, index + 1).join(""),
          delta: char
        });
      });
    });

    const completeAfter = answerStart + Math.max(1, chars.length) * charDelay + 260;
    scheduleFor(record, completeAfter, () => {
      record.status.messages.push({
        messageId: `${conversationId}-assistant-${turnSerial}-${Date.now()}`,
        role: "assistant",
        type: "chat",
        content: answer,
        payload: { turnId },
        createdAt: nowIso()
      });
      record.status.runContext.activeTurnId = "";
      record.status.runContext.lastEventAt = nowIso();
      record.status.conversation.status = record.status.runContext.activeExecutionId
        ? "running"
        : (record.conversation.phase >= 2 && record.status.activeArtifact ? "completed" : "idle");
      record.conversation.updatedAt = nowIso();
      record.conversation.messageCount = record.status.messages.length;
      record.conversation.latestMessagePreview = answer.slice(0, 60);
      if (typeof options.onComplete === "function") options.onComplete(turnId);
      emitRuntime(conversationId, "turn_completed", { turnId });
    });
    return { turnId, completeAfter };
  }

  function newConversation(projectId = "atlas-mobile", mode = "auto") {
    Array.from(conversations.entries()).forEach(([conversationId, record]) => {
      if (!conversationId.startsWith("CONV-MOCK-LIVE-")) return;
      (record.timers || []).forEach((timer) => clearTimeout(timer));
      conversations.delete(conversationId);
    });
    conversationSerial += 1;
    const id = `CONV-MOCK-LIVE-${conversationSerial}`;
    const scenario = nextConversationScenario;
    nextConversationScenario = "text";
    const conversation = {
      conversationId: id,
      title: scenario === "excel" ? "批量用例分析10例" : "10项版本回归分析",
      updatedAt: nowIso(),
      mode,
      messageCount: 1,
      latestMessagePreview: "等待输入",
      hidden: false,
      phase: 0,
      projectId,
      scenario
    };
    const status = {
      conversation: { ...conversation, status: "idle" },
      messages: [{
        messageId: `${id}-welcome`,
        role: "assistant",
        type: "chat",
        content: scenario === "excel"
          ? "已刷新为批量演示会话。接下来会模拟用户发送一个包含 10 行修改点的 Excel 文件。"
          : "已刷新当前演示会话。主 Agent 会先追问推荐口径，再把 10 条输入逐项派给子 Agent。",
        createdAt: nowIso()
      }],
      activeArtifact: null,
      lastSeq: 0,
      runContext: {
        workItems: [],
        executions: {},
        latestExecutionId: "",
        activeExecutionId: "",
        activeTurnId: "",
        executionStatus: "idle",
        activeArtifact: null,
        currentResultView: null,
        workerResults: {},
        latestWorkerResultByWorkItem: {},
        lastEventAt: nowIso()
      }
    };
    conversations.set(id, { conversation, status, feedback: {}, timers: [], scenario });
    return id;
  }

  function startExecution(record, options = {}) {
    executionSerial += 1;
    const scenario = options.scenario || record.scenario || record.conversation.scenario || "text";
    const workItems = scenario === "excel" ? excelWorkItems : defaultWorkItems;
    const executionId = `EXEC-MOCK-${String(executionSerial).padStart(3, "0")}`;
    const firstBatchRunning = ["running", "running", "running", "running", "running", "pending", "pending", "pending", "pending", "pending"];
    const execution = makeExecution("running", 0, workItems, scenario, executionId, firstBatchRunning);
    const artifact = artifactFor(workItems, 0);
    const initialResults = workerResultsFor(execution, artifact);
    record.status.messages.push({
      messageId: `${record.conversation.conversationId}-exec-${executionSerial}`,
      role: "assistant",
      type: "execution",
      content: "",
      executionId: execution.executionId,
      status: "running",
      createdAt: nowIso()
    });
    record.status.runContext = {
      workItems,
      executions: { [execution.executionId]: execution },
      latestExecutionId: execution.executionId,
      activeExecutionId: execution.executionId,
      activeTurnId: "",
      executionStatus: "running",
      activeArtifact: artifact,
      currentResultView: artifact,
      workerResults: initialResults,
      latestWorkerResultByWorkItem: {},
      lastEventAt: nowIso()
    };
    record.status.activeArtifact = artifact;
    record.status.conversation.status = "running";
    emitRuntime(record.conversation.conversationId, "execution_created", { execution });

    function emitWorkerReact(batchIndexes, baseDelay) {
      const offsets = [0, 130, 55, 210, 95];
      batchIndexes.forEach((taskIndex, localIndex) => {
        const task = execution.tasks[taskIndex];
        const template = agentTaskTemplates[taskIndex];
        const offset = offsets[localIndex] || 0;
        scheduleFor(record, baseDelay + offset, () => {
          emitRuntime(record.conversation.conversationId, "thought_delta", {
            taskId: task.taskId,
            step: 1,
            streamKind: "reasoning",
            text: `Thought｜理解第 ${taskIndex + 1} 个输入，规划证据检索与用例覆盖。`,
            delta: `Thought｜理解第 ${taskIndex + 1} 个输入，规划证据检索与用例覆盖。`
          });
        });
        scheduleFor(record, baseDelay + 820 + offset, () => {
          emitRuntime(record.conversation.conversationId, "tool_started", {
            taskId: task.taskId,
            tool: template.tool,
            querySummary: `Action｜${template.note}`
          });
        });
        scheduleFor(record, baseDelay + 2380 + offset, () => {
          emitRuntime(record.conversation.conversationId, "tool_finished", {
            taskId: task.taskId,
            tool: template.tool,
            resultSummary: taskIndex < 2
              ? "Observation｜命中 Bug 直接关联用例，保留为必回归"
              : "Observation｜已取得可解释的历史证据与候选覆盖"
          });
        });
      });
    }

    function applyExecutionSnapshot(update) {
      const current = makeExecution("running", update.count, workItems, scenario, executionId, update.statuses);
      record.status.runContext.executions[current.executionId] = current;
      const liveArtifact = artifactFor(workItems, update.count);
      record.status.runContext.activeArtifact = liveArtifact;
      record.status.runContext.currentResultView = liveArtifact;
      record.status.runContext.workerResults = workerResultsFor(current, liveArtifact);
      record.status.activeArtifact = liveArtifact;
      emitRuntime(record.conversation.conversationId, "execution_patch", { execution: current });
      emitRuntime(record.conversation.conversationId, "result_view", { currentResultView: liveArtifact });
      (update.completed || []).forEach((taskIndex) => {
        const task = current.tasks[taskIndex];
        emitRuntime(record.conversation.conversationId, "worker_progress", {
          taskId: task.taskId,
          text: `Observation｜${task.agentName} 已形成可执行推荐`
        });
      });
    }

    emitWorkerReact([0, 1, 2, 3, 4], 420);
    const updates = [
      {
        after: 5200,
        count: 2,
        statuses: ["succeeded", "running", "succeeded", "running", "running", "pending", "pending", "pending", "pending", "pending"],
        completed: [0, 2]
      },
      {
        after: 6500,
        count: 4,
        statuses: ["succeeded", "succeeded", "succeeded", "running", "succeeded", "pending", "pending", "pending", "pending", "pending"],
        completed: [1, 4]
      },
      {
        after: 7600,
        count: 5,
        statuses: ["succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "running", "running", "running", "running", "running"],
        completed: [3]
      },
      {
        after: 10800,
        count: 7,
        statuses: ["succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "running", "succeeded", "running", "running"],
        completed: [5, 7]
      },
      {
        after: 12200,
        count: 9,
        statuses: ["succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "running", "succeeded"],
        completed: [6, 9]
      },
      {
        after: 13800,
        count: 10,
        statuses: ["succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded", "succeeded"],
        completed: [8]
      }
    ];
    updates.forEach((update) => scheduleFor(record, update.after, () => applyExecutionSnapshot(update)));
    scheduleFor(record, 7600, () => emitWorkerReact([5, 6, 7, 8, 9], 0));

    scheduleFor(record, 14600, () => {
      const completed = makeExecution("completed", agentTaskTemplates.length, workItems, scenario, executionId);
      const finalArtifact = artifactFor(workItems);
      record.status.runContext.executions[completed.executionId] = completed;
      record.status.runContext.activeExecutionId = "";
      record.status.runContext.executionStatus = "completed";
      record.status.runContext.activeArtifact = finalArtifact;
      record.status.runContext.currentResultView = finalArtifact;
      record.status.runContext.workerResults = workerResultsFor(completed, finalArtifact);
      record.status.activeArtifact = finalArtifact;
      record.status.conversation.status = "running";
      record.conversation.title = scenario === "excel" ? "批量用例分析10例" : "10项版本回归分析";
      record.status.conversation.title = record.conversation.title;
      record.status.conversation.phase = 2;
      record.conversation.updatedAt = nowIso();
      record.conversation.messageCount = record.status.messages.length;
      record.conversation.latestMessagePreview = "10 个子 Agent 已完成推荐";
      emitRuntime(record.conversation.conversationId, "execution_finished", { execution: completed, artifact: finalArtifact });
      beginMainTurn(record, {
        thought: "Thought｜10 个子 Agent 均已返回，正在核对用例数量、证据链与优先级。",
        tool: "conversation_memory",
        action: "Action｜读取两批子 Agent 的最终回传",
        observation: "Observation｜共得到 10 条唯一用例，其中 2 条为 Bug 关联必回归",
        answer: scenario === "excel"
          ? "Excel 批量任务已完成：10 个子 Agent 分别处理 10 行修改点，汇总出 10 条唯一用例，其中 2 条为 Bug 关联必回归。你可以继续问优先级、删减理由或执行顺序。"
          : "子 Agent 协作已完成：10 个子 Agent 汇总出 10 条唯一用例，其中 2 条 Bug 关联用例被锁定为必回归。你可以继续问我推荐依据、范围取舍或执行优先级。"
      });
    });
  }

  function addMessage(conversationId, body) {
    const record = conversations.get(conversationId);
    if (!record) return { ok: false, error: "Mock 会话不存在" };
    const content = String(body.content || "").trim();
    record.status.messages.push({
      messageId: body.clientMessageId || `${conversationId}-u-${Date.now()}`,
      role: "user",
      type: "chat",
      content,
      createdAt: nowIso()
    });
    record.conversation.updatedAt = nowIso();
    record.conversation.messageCount = record.status.messages.length;
    record.conversation.latestMessagePreview = content.slice(0, 60);

    if (/为什么|推荐依据|解释/.test(content) && record.conversation.phase >= 2) {
      beginMainTurn(record, {
        thought: "Thought｜用户追问执行优先级，先从已完成的子 Agent 结果中提取风险与直接证据。",
        tool: "conversation_memory",
        action: "Action｜读取 10 项推荐结果与用户约束",
        observation: "Observation｜第 1、2 项命中 Bug 直接关联，第 9 项属于账号数据隔离 P0 风险",
        answer: "根据子 Agent 返回的证据，建议优先执行第 1、2、9 项：前两项与 BUG-99001 的历史用例直接关联，第 9 项涉及账号数据隔离，风险等级为 P0。其余项目可按 P1、P2 顺序执行。"
      });
      return { ok: true };
    }

    if (record.conversation.phase === 0) {
      record.conversation.phase = 1;
      beginMainTurn(record, {
        thought: "Thought｜识别到 10 个独立修改点；派发子 Agent 前需要先确认推荐口径。",
        tool: "intent_clarifier",
        action: "Action｜检查复用优先与新增边界",
        observation: "Observation｜用户尚未明确已有用例与 AI 新增用例的取舍",
        answer: "收到 10 个修改点。派发前确认一个推荐口径：优先复用已有用例，只有未覆盖的风险才生成新用例，对吗？"
      });
      return { ok: true, requiresFollowup: true };
    }

    if (record.conversation.phase >= 2 && !/推荐|检索|补充|再查|重新/.test(content)) {
      beginMainTurn(record, {
        thought: "Thought｜这是对当前结果的沟通追问，不需要主 Agent 自行执行检索。",
        tool: "conversation_memory",
        action: "Action｜保留用户最新约束",
        observation: "Observation｜后续如需重新推荐，再派发新的子 Agent 任务",
        answer: "收到。我会继续负责与你确认取舍和执行顺序；如果需要新增检索或重新推荐，我会再次拆成子任务交给子 Agent。"
      });
      return { ok: true };
    }

    record.conversation.phase = 2;
    beginMainTurn(record, {
      thought: "Thought｜推荐口径已明确，主 Agent 只保留沟通与验收约束。",
      secondThought: "Thought｜把 10 个输入拆成两批，每批 5 个子 Agent 并行执行。",
      tool: "task_dispatcher",
      action: "Action｜创建 10 个检索与推荐子任务",
      observation: "Observation｜任务依赖已整理，可按 5 + 5 两批并行派发",
      answer: "范围已确认。我负责保持对话和验收约束；现在将缺陷关联、已有用例检索、知识检索、风险分析和用例生成拆成 10 个子任务，交给子 Agent 分两批并行完成。",
      onComplete: () => startExecution(record, { scenario: record.scenario || "text" })
    });
    return { ok: true, queued: true };
  }

  const reviewPending = [
    {
      id: "PENDING-MOCK-01",
      status: "pending",
      problem: "跨项目用例只应作为兼容性参考",
      createdAt: "2026-07-29 14:18",
      artifactId: "ART-MOCK-0729",
      negatives: [{ caseId: 92041, title: "上一代重连退避策略兼容性", reason: "协议字段不同，不应直接作为当前项目执行用例" }],
      chatHistory: [
        { role: "user", content: "这条跨项目用例只适合做参考。", createdAt: "14:16" },
        { role: "assistant", content: "已记录负向反馈，并保留其来源项目和关系类型。", createdAt: "14:16" }
      ],
      draft: {
        shouldPersist: true,
        reason: "该反馈可约束跨项目用例的呈现与优先级。",
        experienceCard: {
          name: "跨项目用例引用边界",
          description: "跨项目用例必须显示来源与关系类型，协议不一致时只作为风险参考。",
          whenToUse: "功能切片命中关联项目，且需要跨项目补充风险时",
          directions: ["标注项目来源", "区分执行用例与参考风险"],
          pitfalls: ["不得伪装成本项目现有用例"],
          tags: ["跨项目", "功能切片", "证据边界"],
          confidence: 0.93
        },
        teamMemoryAddition: "跨项目证据只做参考时，不直接进入必回归清单。"
      }
    }
  ];

  const reviewCards = [
    { name: "弱网状态一致性检查", description: "涉及重试、缓存写入或状态机修改时，检查重复回调与最终一致性。", tags: ["弱网", "状态机", "一致性"] },
    { name: "跨项目用例引用边界", description: "跨项目用例保留来源与关系类型，不伪装为当前项目用例。", tags: ["跨项目", "证据", "路由"] }
  ];

  let job = { name: null, status: "idle", log: [], progress: null, busy: false, projectId: "atlas-mobile" };
  let jobStartedAt = 0;
  function jobSnapshot() {
    if (job.status !== "running") return job;
    const elapsed = Date.now() - jobStartedAt;
    const total = job.name === "insights" ? 20 : 100;
    const cur = Math.min(total, Math.max(1, Math.floor(elapsed / 55)));
    const lines = [
      `[mock] ${job.name} 使用纯前端演示数据`,
      `[progress] cur=${cur} total=${total} ok=${cur} fail=0 skip=0`,
      cur > total * 0.3 ? `[ok] 已处理 Mock 记录 ${cur}/${total}` : "[mock] 正在初始化",
      cur > total * 0.7 ? "[AI] 正在生成根因、修复动作和统一标签" : "[link] 正在校验 Bug-Case 关系"
    ];
    if (cur >= total) {
      job = {
        ...job,
        status: "done",
        busy: false,
        busyMessage: null,
        endedAt: new Date().toLocaleString("zh-CN"),
        returncode: 0,
        progress: { cur: total, total, ok: total, fail: 0, skip: 0 },
        log: [...lines, "[ok] Mock 数据基座任务完成"]
      };
    } else {
      job = {
        ...job,
        busy: true,
        busyMessage: `任务进行中：${job.name} · 项目 ${job.projectId} · Mock 演示`,
        progress: { cur, total, ok: cur, fail: 0, skip: 0 },
        log: lines,
        extractLatest: job.name === "insights" ? { bugId: 99001 + cur % 6, action: "ok", category: "交易链路", rootCause: "并发时序", fixAction: "状态机收敛", symptomTags: ["弱网"], componentTags: ["LocalCache"] } : null,
        extractRecent: job.name === "insights" ? [{ bugId: 99001 + cur % 6, action: "ok", category: "交易链路", rootCause: "并发时序", fixAction: "状态机收敛" }] : []
      };
    }
    return job;
  }

  function findConversationId(path) {
    const match = path.match(/^\/api\/conversations\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  async function routeApi(url, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    const path = url.pathname;
    const body = parseBody(options);

    if (path === "/api/projects/registry" && method === "GET") return json(registry);
    if (path === "/api/projects/registry" && method === "POST") {
      if (Array.isArray(body.projects)) registry.projects = body.projects;
      if (Array.isArray(body.relations)) registry.relations = body.relations;
      return json({ ok: true, registry });
    }
    if (/^\/api\/projects\/[^/]+\/status$/.test(path)) {
      return json({
        ok: true,
        bugCount: 4286,
        caseCount: 9472,
        insightCount: 4150,
        vectorCount: 9472,
        knowledge: {
          configured: true,
          provider: "dify",
          datasetIdMasked: "mock-••••-mobile"
        }
      });
    }
    if (/^\/api\/projects\/[^/]+\/knowledge\/test$/.test(path)) {
      return json({ ok: true, chunks: [{ score: 0.91, title: "Mock 项目设计", content: "状态机与重连策略参考片段。" }], count: 1 });
    }
    if (path === "/api/zentao/projects") return json({ ok: false, projects: [], hint: "演示模式不连接真实禅道" });
    if (path === "/api/zentao/auth") return json(method === "GET" ? { account: "mock-user", hasPassword: false, hasApiToken: false, hasCookie: false } : { ok: true });

    if (path === "/api/overview") return json({ dbReady: true, bugs: 4286, cases: 9472, images: 812, imagesLocal: 812, insights: 4150, vectors: 9472 });
    if (path === "/api/llm-slots") return json({ extract: { modelName: "Mock Insight Model", displayName: "Mock Insight Model", assigned: true }, vision: { modelName: "Mock Vision Model", displayName: "Mock Vision Model", assigned: true } });
    if (path === "/api/taxonomy") return json({ level1: ["交易链路", "账号体系", "消息中心", "数据同步", "工具能力"] });
    if (path === "/api/bugs") {
      const q = (url.searchParams.get("q") || "").toLowerCase();
      const onlyInsight = url.searchParams.get("onlyInsight") === "1";
      const rows = bugRows.filter((row) => (!q || `${row.id} ${row.title} ${row.actualL1} ${row.rootCauseType}`.toLowerCase().includes(q)) && (!onlyInsight || row.hasInsight));
      return json({ total: rows.length, rows });
    }
    if (path.startsWith("/api/bug/")) return json(bugDetail(path.split("/").pop()));
    if (path === "/api/cases") {
      const q = (url.searchParams.get("q") || "").toLowerCase();
      const rows = caseRows.filter((row) => !q || `${row.caseCode} ${row.title} ${row.scenario}`.toLowerCase().includes(q));
      return json({ total: rows.length, rows });
    }
    if (path.startsWith("/api/case/")) return json(caseDetail(path.split("/").pop()));
    if (path === "/api/job" && method === "GET") return json(jobSnapshot());
    if (path === "/api/job" && method === "POST") {
      jobStartedAt = Date.now();
      job = { name: body.name || "data", projectId: body.projectId || "atlas-mobile", status: "running", startedAt: new Date().toLocaleString("zh-CN"), endedAt: null, returncode: null, log: ["[mock] 已启动纯前端演示任务"], progress: null, busy: true, busyMessage: "Mock 任务启动中" };
      return json({ ok: true, name: job.name });
    }
    if (path === "/api/job/cancel") {
      job = { ...job, status: "cancelled", busy: false, endedAt: new Date().toLocaleString("zh-CN"), returncode: -1, log: [...(job.log || []), "[cancelled] Mock 任务已取消"] };
      return json({ ok: true });
    }
    if (path === "/api/token-usage") {
      const runId = url.searchParams.get("runId");
      if (runId) return json({ runId, currency: "CNY", inputTokens: 18240, outputTokens: 4960, totalTokens: 23200, costCny: 0.1846, calls: 12 });
      return json({ allTime: { currency: "CNY", inputTokens: 1482300, outputTokens: 386200, totalTokens: 1868500, costCny: 14.823, calls: 846, cachedCalls: 126, byModel: [{ model: "Mock Reasoning Model", inputTokens: 982000, outputTokens: 256000, totalTokens: 1238000, inputPricePerM: 6, outputPricePerM: 18, costCny: 10.48, calls: 422, cachedCalls: 86 }, { model: "Mock Fast Model", inputTokens: 500300, outputTokens: 130200, totalTokens: 630500, inputPricePerM: 2, outputPricePerM: 6, costCny: 4.343, calls: 424, cachedCalls: 40 }] } });
    }
    if (path === "/api/token-usage/backfill") return json({ ok: true, added: 0, skipped: 846 });
    if (path === "/api/llm-trace") return json({ rows: [{ ts: "2026-07-29 14:32:07", bugId: 99001, phase: "extract", model: "Mock Insight Model", elapsedMs: 842, ok: true, rawContent: "{\"rootCauseType\":\"并发时序\",\"confidence\":0.97}" }] });

    if (path === "/api/agent/tool-catalog") {
      return json({
        mainAgentModel: { displayName: "对话与调度模型", modelName: "mock-orchestrator-v2" },
        main: [
          { name: "intent_clarifier", label: "意图澄清", summary: "追问范围与约束", alwaysOn: true },
          { name: "conversation_memory", label: "会话记忆", summary: "保留用户澄清", alwaysOn: true },
          { name: "task_dispatcher", label: "任务派发", summary: "把检索与推荐拆给子 Agent", alwaysOn: true }
        ],
        worker: [
          { name: "search_bug_case_pairs", label: "缺陷-用例关联", summary: "直接关联检索", alwaysOn: true },
          { name: "search_cases", label: "已有用例检索", summary: "标签与模块检索", alwaysOn: true },
          { name: "vector_search", label: "向量检索", summary: "语义召回", alwaysOn: true },
          { name: "dify_search", label: "项目知识库", summary: "Mock 项目知识", flag: "use_dify", default: true },
          { name: "generate_cases", label: "用例生成", summary: "生成可执行步骤", alwaysOn: true },
          { name: "build_workbook", label: "Excel 编排", summary: "批量结果整理", alwaysOn: true }
        ]
      });
    }
    if (path === "/api/conversations" && method === "GET") {
      const rows = Array.from(conversations.values()).map((record) => record.conversation).filter((item) => !item.hidden || url.searchParams.get("includeHidden") === "1").sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      return json({ conversations: rows });
    }
    if (path === "/api/conversations" && method === "POST") {
      const id = newConversation(body.projectId, body.mode);
      return json({ ok: true, conversationId: id });
    }
    if (path.startsWith("/api/conversations/")) {
      const conversationId = findConversationId(path);
      const record = conversations.get(conversationId);
      if (!record) return json({ error: "Mock 会话不存在" }, 404);
      if (path.endsWith("/status") && method === "GET") return json(record.status);
      if (path.endsWith("/events") && method === "GET") return json({ events: [], lastSeq: record.status.lastSeq || 0 });
      if (path.endsWith("/messages") && method === "POST") return json(addMessage(conversationId, body));
      if (path.endsWith("/feedback") && method === "GET") return json({ feedback: record.feedback });
      if (path.endsWith("/usage") && method === "GET") {
        return json({ totalTokens: record.conversation.phase >= 2 ? 23200 : 1860, costCny: record.conversation.phase >= 2 ? 0.1846 : 0.0128, calls: record.conversation.phase >= 2 ? 12 : 1 });
      }
      if (path.endsWith("/feedback") && method === "POST") {
        record.feedback[body.caseRef] = { verdict: body.verdict, reason: body.reason || "", createdAt: nowIso() };
        return json({ ok: true, feedback: record.feedback[body.caseRef] });
      }
      if (path.endsWith("/retrospect") && method === "POST") return json({ ok: true, pendingId: "PENDING-MOCK-02" });
      if (path.endsWith("/control") && method === "POST") return json({ ok: true });
      if (path.includes("/batch-upload") && method === "POST") {
        record.scenario = "excel";
        record.conversation.scenario = "excel";
        record.conversation.phase = 2;
        record.conversation.title = "批量用例分析10例";
        record.status.conversation.title = "批量用例分析10例";
        record.status.messages.push({
          messageId: `${conversationId}-excel-${Date.now()}`,
          role: "user",
          type: "file",
          content: "迭代回归范围_10例.xlsx",
          payload: { fileName: "迭代回归范围_10例.xlsx", fileType: "Excel", rowCount: 10, fileSize: "28 KB" },
          createdAt: nowIso()
        });
        beginMainTurn(record, {
          thought: "Thought｜识别到一个包含 10 行修改点的 Excel 文件，需要先解析行结构再派发。",
          secondThought: "Thought｜每行对应一个推荐任务，按 5 + 5 两批并行处理。",
          tool: "task_dispatcher",
          action: "Action｜解析 Excel 并创建 10 个子任务",
          observation: "Observation｜10 行数据均通过格式校验，可进入检索与推荐",
          answer: "已收到包含 10 行修改点的 Excel 文件。表格解析、检索、风险分析、用例生成和结果编排已逐项派给 10 个子 Agent，接下来分两批并行执行。",
          onComplete: () => startExecution(record, { scenario: "excel" })
        });
        return json({ ok: true, rowCount: excelWorkItems.length, imported: excelWorkItems.length, queued: true });
      }
      if (method === "PATCH") {
        Object.assign(record.conversation, body);
        Object.assign(record.status.conversation, body);
        return json({ ok: true, conversation: record.conversation });
      }
      if (method === "DELETE") {
        record.conversation.hidden = true;
        return json({ ok: true });
      }
    }

    if (path === "/api/review/feedback") {
      return json({ groups: [{
        conversationId: "CONV-MOCK-READY",
        conversationTitle: "弱网重连状态回滚（完整示例）",
        artifactId: "ART-MOCK-0729",
        usefulCount: 2,
        uselessCount: 1,
        messageCount: 5,
        retrospectStatus: "not_started",
        updatedAt: "2026-07-29 14:18",
        feedback: [
          { verdict: "useful", title: "重复回调下状态写入幂等性", caseRef: "caseKey:mock:case:0836", reason: "" },
          { verdict: "useless", title: "上一代重连策略兼容性", caseRef: "caseKey:mock:case:2041", reason: "协议字段不同，只适合作为参考" }
        ]
      }] });
    }
    if (path === "/api/review/pending") return json({ pending: reviewPending });
    if (path === "/api/review/cards") return json({ cards: reviewCards, teamMemory: "• 弱网重连修改必须验证最终一致性与重复回调幂等。\n• 跨项目证据必须标注来源与关系类型。\n• 未审批草稿不进入推荐检索。" });
    if (path === "/api/review/approve") {
      const item = reviewPending.find((entry) => entry.id === body.id);
      if (item) item.status = "approved";
      return json({ ok: true, applied: { card: item && item.draft && item.draft.experienceCard.name, teamMemory: { length: 148, limit: 2000, overLimit: false } } });
    }
    if (path === "/api/review/reject") {
      const item = reviewPending.find((entry) => entry.id === body.id);
      if (item) item.status = "rejected";
      return json({ ok: true });
    }

    return json({ ok: true, mock: true });
  }

  window.fetch = function (input, options = {}) {
    const raw = typeof input === "string" ? input : input.url;
    const url = new URL(raw, window.location.href);
    if (url.pathname.startsWith("/api/")) return routeApi(url, options);
    return nativeFetch(input, options);
  };

  function downloadMockCsv() {
    const rows = [["用例编号", "标题", "角色"], ...baseCases.map((item) => [
      item.caseCode || item.generatedCaseId,
      item.title,
      item._lockedLinkedRegression ? "Bug关联必回归" : item.type === "existing" ? "已有用例" : "AI新增"
    ])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "TestCaseGenAgent-Mock-推荐清单.csv";
    link.click();
    URL.revokeObjectURL(href);
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function waitUntil(check, timeout = 12000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (check()) return true;
      await sleep(80);
    }
    return false;
  }

  async function typeComposer(text) {
    const composer = document.querySelector("#composer");
    if (!composer) return;
    composer.value = "";
    composer.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      composer.value = text;
      composer.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    let index = 0;
    while (index < text.length) {
      index = Math.min(text.length, index + (index < 12 ? 1 : 2));
      composer.value = text.slice(0, index);
      composer.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(34);
    }
  }

  let demoRunning = false;
  function setDemoControls(running, label = "") {
    document.body.classList.toggle("demo-running", running);
    document.querySelectorAll("[data-demo-control]").forEach((button) => {
      button.disabled = running;
    });
    const status = document.querySelector("#demoRunStatus");
    if (status) {
      status.textContent = running ? label : "可重复播放";
      status.classList.toggle("running", running);
    }
  }

  async function runDemo(kind = "text") {
    if (demoRunning || typeof window.createConversation !== "function") return;
    demoRunning = true;
    const excel = kind === "excel";
    setDemoControls(true, excel ? "Excel 演示中…" : "自动演示中…");
    nextConversationScenario = excel ? "excel" : "text";
    try {
      await window.createConversation();
      await waitUntil(() => {
        const send = document.querySelector("#sendButton");
        return send && !send.disabled;
      });
      if (excel) {
        const upload = document.querySelector("#batchUploadButton");
        if (upload) {
          upload.classList.add("demo-focus");
          await sleep(1500);
          upload.classList.remove("demo-focus");
        }
        const file = new File(
          ["Mock Excel：10 行迭代修改点，仅用于前端演示。"],
          "迭代回归范围_10例.xlsx",
          { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        );
        await window.batchUpload(file);
      } else {
        await typeComposer(textDemoPrompt);
        await sleep(560);
        await window.sendMessage();
        await waitUntil(() => {
          const send = document.querySelector("#sendButton");
          return send && !send.disabled;
        }, 12000);
        await sleep(900);
        await typeComposer("对，已有用例优先；未覆盖的风险再生成新用例，并保留推荐依据。");
        await sleep(620);
        await window.sendMessage();
      }
      await waitUntil(() => {
        const badge = document.querySelector(".execution summary .status.completed");
        return Boolean(badge);
      }, 36000);
      await waitUntil(() => {
        const send = document.querySelector("#sendButton");
        return send && !send.disabled;
      }, 12000);
      if (!excel) {
        await sleep(1200);
        await typeComposer("这 10 条里哪些必须优先执行？为什么？");
        await sleep(520);
        await window.sendMessage();
        await waitUntil(() => {
          const send = document.querySelector("#sendButton");
          return send && !send.disabled;
        }, 12000);
      }
      if (typeof window.toast === "function") {
        window.toast(excel
          ? "Excel 演示完成；点击“新建会话”会刷新并重播文本演示"
          : "自动演示与结果追问已完成；点击“新建会话”可重新播放");
      }
    } finally {
      demoRunning = false;
      setDemoControls(false);
    }
  }

  window.MockDemo = {
    play: () => runDemo("text"),
    playExcel: () => runDemo("excel")
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.setProperty("scroll-behavior", "smooth");
    const header = document.querySelector("header");
    if (header) {
      const badge = document.createElement("span");
      badge.textContent = "演示模式 · 全部数据为 Mock";
      badge.className = "badge demo-mode-badge";
      Object.assign(badge.style, {
        border: "1px solid color-mix(in srgb, var(--ac, var(--blue, #3157d5)) 36%, transparent)",
        borderRadius: "999px",
        padding: "3px 9px",
        color: "var(--ac, var(--blue, #3157d5))",
        background: "color-mix(in srgb, var(--ac, var(--blue, #3157d5)) 8%, transparent)",
        fontSize: "11px",
        whiteSpace: "nowrap"
      });
      const nav = header.querySelector("nav");
      if (nav) header.insertBefore(badge, nav);
      else header.appendChild(badge);
    }

    const links = document.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      const map = {
        "/": "./index.html",
        "/data": "./data.html",
        "/data.html": "./data.html",
        "/recommend": "./recommend.html",
        "/recommend.html": "./recommend.html",
        "/projects": "./projects.html",
        "/projects.html": "./projects.html",
        "/review": "./review.html",
        "/review.html": "./review.html",
        "/ui.js": "./ui.js"
      };
      if (map[href]) link.setAttribute("href", map[href]);
    });

    document.querySelectorAll("[onclick]").forEach((element) => {
      const value = element.getAttribute("onclick");
      if (!value || !value.includes("window.location.href")) return;
      if (value.includes("/recommend")) element.setAttribute("onclick", "window.location.href='./recommend.html'");
      else if (value.includes("/projects")) element.setAttribute("onclick", "window.location.href='./projects.html'");
    });

    if (document.querySelector("#layout") && document.querySelector("#composer")) {
      const nav = document.querySelector("header .nav");
      if (nav) {
        const controls = document.createElement("div");
        controls.className = "demo-controls";
        controls.innerHTML = `
          <span class="demo-run-status" id="demoRunStatus">可重复播放</span>
          <button class="ghost" data-demo-control type="button">▶ 自动演示</button>
          <button class="ghost" data-demo-control type="button">Excel 演示</button>`;
        const buttons = controls.querySelectorAll("button");
        buttons[0].addEventListener("click", () => runDemo("text"));
        buttons[1].addEventListener("click", () => runDemo("excel"));
        nav.parentElement.insertBefore(controls, nav);
      }
      const newSession = document.querySelector(".new-session");
      if (newSession) {
        newSession.title = "刷新当前演示会话并从头自动播放";
        const tip = document.createElement("div");
        tip.className = "demo-replay-tip";
        tip.textContent = "新建会话会刷新当前演示并从头重播";
        newSession.insertAdjacentElement("afterend", tip);
      }
      window.exportWorkbook = downloadMockCsv;
      const params = new URLSearchParams(window.location.search);
      if (params.get("autoplay") === "1") {
        setTimeout(() => runDemo("text"), 1000);
      }
    }
  });
}());
