'use strict';
// Purpose-built fictional examples. These are not live customer records or AI calls.
window.TwinStories = Object.freeze({
  'identity-personality': {
    title: 'One message. Your way of speaking.',
    facts: [['Approved style', 'Clear, warm and direct'], ['Boundary', 'No unverified delivery promises']],
    question: '“Will my order arrive tomorrow?”',
    action: 'Show the configured reply',
    answer: '“Happy to check that for you. I’ll need the confirmed delivery update before giving you a date.”',
    reason: 'The reply follows the approved style without inventing a delivery date. No order has been checked in this example.'
  },
  'business-knowledge': {
    title: 'An answer with a source behind it',
    facts: [['Approved policy · example v3', 'Returns within 30 days; unused items only'], ['Product record', 'Custom orders excluded']],
    question: '“Can I return a custom-made item after two weeks?”',
    action: 'Show the source-grounded answer',
    answer: 'The example policy excludes custom-made items from its standard returns window. A team member should review any issue with the item before advising on the next step.',
    reason: 'Uses policy v3 and the product exclusion together. This fictional policy is not legal advice or Construct’s own returns policy.'
  },
  'relationship-context': {
    title: 'Pick up where the customer left off',
    facts: [['Earlier conversation', 'Maya needs a booking website for a second studio'], ['Open decision', 'Keep the current brand or refresh it']],
    question: '“Can we move ahead with the second location?”',
    action: 'Show the contextual next step',
    answer: 'Start with the second studio’s booking journey. Confirm the outstanding brand decision with Maya before preparing the new pages.',
    reason: 'Uses an unresolved commitment, not just the customer’s name. Identity and permissions would be checked in a live implementation.'
  },
  'conversational-intelligence': {
    title: 'Understand the request behind the words',
    facts: [['First message', '“We lose enquiries while the team is on site.”'], ['Follow-up', '“Mostly calls, sometimes website messages.”']],
    question: '“Where would you start?”',
    action: 'Show a focused response',
    answer: 'Start with capturing missed-call enquiries and a clear callback queue. Then bring website enquiries into that same review process, subject to checking the phone and website connections.',
    reason: 'Combines both messages into one practical starting point instead of listing unrelated automations.'
  },
  'email-automation': {
    title: 'Turn an email into a reviewable reply',
    facts: [['Incoming email', 'Supplier asks whether an amended delivery date is acceptable'], ['Project constraint', 'Site access begins Monday']],
    question: '“Can we accept delivery on Friday?”',
    action: 'Show the draft approach',
    answer: 'Flag the scheduling conflict and draft a request for Monday delivery. Ask the project owner to approve it before sending.',
    reason: 'Uses the site-access constraint. No mailbox is connected and no email is sent.'
  },
  'calendar-tasks': {
    title: 'Catch a scheduling conflict early',
    facts: [['Proposed visit', 'Tuesday, 10:00–11:00 Brisbane time'], ['Example calendar', 'Team meeting, Tuesday, 10:30–11:30']],
    question: '“Can this appointment go ahead?”',
    action: 'Check the example schedule',
    answer: 'The proposed visit overlaps the team meeting by 30 minutes. Ask for another time and check travel time before confirming an appointment.',
    reason: 'Compares the two fictional time ranges. No appointment is booked.'
  },
  'lead-qualification': {
    title: 'Put the right enquiry with the right person',
    facts: [['Enquiry', 'Commercial fit-out, Sunshine Coast, six-week target'], ['Routing rule', 'Commercial projects go to the commercial estimator']],
    question: '“Who should handle this, and what is missing?”',
    action: 'Show the routing recommendation',
    answer: 'Recommend the commercial estimator. Request the drawings and site-access details before assessing the six-week target.',
    reason: 'Routes by an approved service rule, without inventing a quote or promising availability.'
  },
  'nurturing-follow-up': {
    title: 'Follow up when it is appropriate',
    facts: [['Approved rule', 'One follow-up after two days without a reply'], ['Latest event', 'Customer replied this morning']],
    question: '“Should the scheduled follow-up continue?”',
    action: 'Apply the stopping rule',
    answer: 'No. The new reply stops the scheduled sequence. Review and respond to that message instead of sending another reminder.',
    reason: 'Reply, opt-out and human takeover are stopping conditions. This example sends nothing.'
  },
  'pipeline-intelligence': {
    title: 'See what is holding a deal back',
    facts: [['Opportunity A', 'Proposal reviewed; decision-maker not confirmed'], ['Opportunity B', 'Scope agreed; awaiting a site visit']],
    question: '“What deserves attention next?”',
    action: 'Show the next-step analysis',
    answer: 'For A, confirm who can approve the proposal. For B, arrange a site-visit proposal for review. Neither record supports predicting a guaranteed close.',
    reason: 'Separates two different blockers using the available deal records, without treating missing data as progress.'
  },
  'customer-lifecycle': {
    title: 'Keep a customer informed, accurately',
    facts: [['Verified milestone', 'Installation complete'], ['Not yet verified', 'Final inspection outcome']],
    question: '“What update can we give the customer?”',
    action: 'Show the proposed update',
    answer: 'Confirm that installation is complete and explain that final inspection is still awaiting confirmation. Do not describe the entire project as signed off.',
    reason: 'Communicates the verified milestone without turning an unknown into a promise. Nothing is delivered externally.'
  },
  retention: {
    title: 'Eligibility before outreach',
    facts: [['Customer A', 'Inactive for 90 days; marketing permission recorded'], ['Customer B', 'Inactive for 90 days; opted out']],
    question: '“Who could enter a re-engagement review?”',
    action: 'Check the example eligibility',
    answer: 'A may be reviewed against channel and frequency rules. B is excluded because of the opt-out. Inactivity alone is not permission to contact someone.',
    reason: 'Checks consent before considering timing or past interests. No campaign is started.'
  },
  'crm-workspace': {
    title: 'A relationship, not scattered notes',
    facts: [['Website enquiry', 'Jordan requested an accessible bathroom renovation'], ['Verified follow-up', 'Site visit needed; owner: Alex']],
    question: '“What should Alex see in the handover?”',
    action: 'Show the example customer summary',
    answer: 'Request: accessible bathroom renovation. Next step: propose a site visit. Owner: Alex. Budget and drawings: not provided.',
    reason: 'Combines verified context and outstanding questions without inventing missing fields or joining unverified identities.'
  },
  'content-commerce': {
    title: 'Offer only what is approved',
    facts: [['Approved catalogue', 'Starter bundle, A$120, Australian delivery only'], ['Customer request', 'Delivery to New Zealand']],
    question: '“Can this bundle be offered as requested?”',
    action: 'Check the example offer',
    answer: 'Not with the recorded delivery rules. Ask the team to verify New Zealand eligibility before quoting delivery or offering checkout.',
    reason: 'Checks delivery eligibility as well as price. No purchase or fulfilment is created.'
  },
  'team-collaboration': {
    title: 'A clear owner and a useful handover',
    facts: [['Current owner', 'Alex, on leave'], ['Approved cover', 'Sam, service enquiries only']],
    question: '“Who can pick up a new service enquiry?”',
    action: 'Show the handover proposal',
    answer: 'Propose Sam as the covering owner, with the relevant customer history and unresolved questions. Keep financial approvals outside Sam’s service-only scope.',
    reason: 'Transfers context without extending the covering operator’s permissions. No live assignment is changed.'
  },
  'system-integrations': {
    title: 'Verify a connection before relying on it',
    facts: [['Requested workflow', 'Approved quote to accounting draft'], ['Connection status', 'Provider, API access and write permissions unverified']],
    question: '“What has to be checked first?”',
    action: 'Show the integration checklist',
    answer: 'Verify the software plan, required API operations, permitted data, authentication and duplicate protection. Agree the approval step before any external draft is created.',
    reason: 'A proposed integration is not an existing connector. This public site has no access to business accounts.'
  },
  'access-permissions': {
    title: 'Permission follows the role',
    facts: [['Role', 'Service operator'], ['Allowed', 'View assigned enquiries; prepare internal reply drafts']],
    question: '“Can this operator export all customer records?”',
    action: 'Show the permission decision',
    answer: 'No. A service-only role does not include a bulk export. Route that request to an authorised administrator instead.',
    reason: 'Illustrates a permission boundary; it does not claim the public website has live role-based access to customer data.'
  },
  'data-boundaries': {
    title: 'Useful context, within the right boundary',
    facts: [['Current workspace', 'Example Company A'], ['Requested source', 'A conversation belonging to Example Company B']],
    question: '“Can that other conversation inform this answer?”',
    action: 'Show the boundary decision',
    answer: 'No. Keep the answer within Company A’s permitted sources. Do not retrieve Company B’s conversation to fill a gap.',
    reason: 'Organisation and identity boundaries must be enforced and tested in the configured deployment.'
  },
  'data-lifecycle': {
    title: 'Deletion has a defined scope',
    facts: [['Request', 'Remove a customer’s saved context'], ['Locations to assess', 'Active records, backups and processing providers']],
    question: '“What does a complete removal plan cover?”',
    action: 'Show the lifecycle review',
    answer: 'Check authority and retention obligations, define removal from active records, and state the separate backup and provider timelines. Confirm outcomes rather than promising instant deletion everywhere.',
    reason: 'This is an architecture example, not a deletion request or an assertion about provider retention.'
  },
  'ai-provider-controls': {
    title: 'Know what leaves the environment',
    facts: [['Task', 'Summarise an approved service note'], ['Not needed', 'Payment details and unrelated customer records']],
    question: '“What should the model receive?”',
    action: 'Show the proposed data scope',
    answer: 'Only the relevant approved note, with unnecessary sensitive details removed. Check the selected provider’s retention, processing location and access terms before enabling the workflow.',
    reason: 'Provider settings are deployment decisions, not guarantees supplied by this public demonstration.'
  }
});
