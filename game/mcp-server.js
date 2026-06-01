const TOOL_DEFINITIONS = {
  intelligence: [
    {
      name: 'get_world_state',
      description: 'Get the complete world overview: all factions, regions, turn count, global tension, connected AI agents.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_faction_info',
      description: 'Get detailed information about a specific faction: military, economy, regions, doctrine, personality.',
      inputSchema: {
        type: 'object',
        properties: {
          factionId: { type: 'string', description: 'Faction ID to inspect' },
        },
        required: ['factionId'],
      },
    },
    {
      name: 'get_region_info',
      description: 'Get detailed information about a specific region: owner, population, resources, neighbors, troops, garrison, fortification.',
      inputSchema: {
        type: 'object',
        properties: {
          regionId: { type: 'string', description: 'Region ID or name (e.g. "berlin" or "paris")' },
        },
        required: ['regionId'],
      },
    },
    {
      name: 'get_troop_deployment',
      description: 'Get your per-region troop deployment: troops, garrison, fortification, and defending strength for every owned region.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_military_intel',
      description: 'Get estimated military intelligence on another faction. Accuracy depends on relationship (allies=high, enemies=low) and spy network.',
      inputSchema: {
        type: 'object',
        properties: {
          factionId: { type: 'string', description: 'Target faction ID' },
        },
        required: ['factionId'],
      },
    },
    {
      name: 'get_diplomatic_overview',
      description: 'See all your diplomatic relations: trust levels, opinion, alliances, wars, trades with every faction.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_events_feed',
      description: 'Get recent world events: wars, battles, alliances, betrayals, natural disasters, rebellions.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of recent events to return (max 50)' },
        },
      },
    },
    {
      name: 'get_connected_agents',
      description: 'See all currently connected AI agents and which factions they control.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],

  military: [
    {
      name: 'recruit_troops',
      description: 'Recruit army troops for your faction. Costs economy. Doctrine modifiers apply (Eastern gets discounts, Western gets fewer but stronger units).',
      inputSchema: {
        type: 'object',
        properties: {
          count: { type: 'number', description: 'Number of troops to recruit (max 1000)' },
          regionId: { type: 'string', description: 'Optional owned region ID/name to deploy new troops to. Defaults to strongest owned region.' },
        },
        required: ['count'],
      },
    },
    {
      name: 'build_aircraft',
      description: 'Build air force units. Requires economy. Essential for airstrikes and air superiority.',
      inputSchema: {
        type: 'object',
        properties: {
          count: { type: 'number', description: 'Number of aircraft to build (max 200)' },
        },
        required: ['count'],
      },
    },
    {
      name: 'build_naval',
      description: 'Build navy units. Requires economy. Important for coastal defense and naval power projection.',
      inputSchema: {
        type: 'object',
        properties: {
          count: { type: 'number', description: 'Number of naval units to build (max 50)' },
        },
        required: ['count'],
      },
    },
    {
      name: 'attack_region',
      description: 'Attack a target region. Can attack enemy-held regions (starts a battle) or neutral regions (fights garrison). Must share a border with your territory.',
      inputSchema: {
        type: 'object',
        properties: {
          regionId: { type: 'string', description: 'Target region ID or name' },
          fromRegionId: { type: 'string', description: 'Optional: staging region to attack from' },
          troops: { type: 'number', description: 'Optional number of troops to commit from the staging region. Defaults to all available troops in that region.' },
        },
        required: ['regionId'],
      },
    },
    {
      name: 'fortify_region',
      description: 'Fortify one of your regions. Increases garrison and fortification level. Costs economy.',
      inputSchema: {
        type: 'object',
        properties: {
          regionId: { type: 'string', description: 'Your region to fortify' },
          level: { type: 'number', description: 'Fortification level to add (costs 30 per level)' },
        },
        required: ['regionId'],
      },
    },
    {
      name: 'move_troops',
      description: 'Move troops between your own regions (they must be connected).',
      inputSchema: {
        type: 'object',
        properties: {
          fromRegionId: { type: 'string', description: 'Source region' },
          toRegionId: { type: 'string', description: 'Destination region' },
          count: { type: 'number', description: 'Number of troops to move' },
        },
        required: ['fromRegionId', 'toRegionId'],
      },
    },
    {
      name: 'launch_airstrike',
      description: 'Launch an airstrike on a target region. Damages garrison and enemy troops. Requires 10+ air force.',
      inputSchema: {
        type: 'object',
        properties: {
          regionId: { type: 'string', description: 'Target region ID or name' },
        },
        required: ['regionId'],
      },
    },
    {
      name: 'deploy_troops',
      description: 'Deploy troops from multiple regions to one or more target regions. Troops move automatically per turn through friendly/allied territory. Requires owned or allied-with-access path.',
      inputSchema: {
        type: 'object',
        properties: {
          fromRegions: { type: 'array', items: { type: 'string' }, description: 'Source region IDs' },
          toRegions: { type: 'array', items: { type: 'string' }, description: 'Target region IDs. Troops are split evenly between targets.' },
          count: { type: 'number', description: 'Total troops to deploy (optional, defaults to all available)' },
        },
        required: ['fromRegions', 'toRegions'],
      },
    },
    {
      name: 'get_movement_orders',
      description: 'Check pending auto-deploy movement orders for your faction.',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Optional: specific order ID to check' },
        },
      },
    },
  ],

  economy: [
    {
      name: 'set_tax_rate',
      description: 'Set your national tax rate (0.0 to 1.0). Higher taxes = more income but slower growth. Lower taxes = happier population.',
      inputSchema: {
        type: 'object',
        properties: {
          rate: { type: 'number', description: 'Tax rate from 0.0 to 1.0 (e.g. 0.3 = 30%)' },
        },
        required: ['rate'],
      },
    },
    {
      name: 'invest_in_industry',
      description: 'Invest in national industrial development. Increases tech level and long-term economic output.',
      inputSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Economy to invest' },
        },
        required: ['amount'],
      },
    },
    {
      name: 'invest_infrastructure',
      description: 'Invest in infrastructure for a specific region. Increases population and resource output.',
      inputSchema: {
        type: 'object',
        properties: {
          regionId: { type: 'string', description: 'Your region to develop' },
          amount: { type: 'number', description: 'Economy to invest' },
        },
        required: ['regionId'],
      },
    },
    {
      name: 'trade_resources',
      description: 'Trade resources with another faction. Improves diplomatic relations and trust. Cannot trade with enemies.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to trade with' },
          resource: { type: 'string', enum: ['food', 'oil', 'minerals', 'tech'], description: 'Resource type' },
          amount: { type: 'number', description: 'Amount to trade (max 100)' },
        },
        required: ['targetFactionId', 'resource', 'amount'],
      },
    },
    {
      name: 'impose_sanctions',
      description: 'Impose economic sanctions on another faction. Reduces their economy but increases global tension.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to sanction' },
        },
        required: ['targetFactionId'],
      },
    },
  ],

  diplomacy: [
    {
      name: 'send_message',
      description: 'Send a diplomatic message to another faction. Messages appear in the global chat log.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Recipient faction' },
          message: { type: 'string', description: 'Your message' },
          type: { type: 'string', enum: ['chat', 'war_declaration', 'alliance_offer', 'threat', 'diplomacy'], description: 'Message type' },
        },
        required: ['targetFactionId', 'message'],
      },
    },
    {
      name: 'propose_alliance',
      description: 'Propose a military alliance to another faction. They must respond with respond_alliance. Allies share intel and can call each other to war.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to ally with' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'respond_alliance',
      description: 'Accept or reject a pending alliance proposal.',
      inputSchema: {
        type: 'object',
        properties: {
          accept: { type: 'boolean', description: 'true to accept, false to reject' },
        },
        required: ['accept'],
      },
    },
    {
      name: 'break_alliance',
      description: 'Break an existing alliance. Damages trust and causes emotional reactions. May trigger wars.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to break alliance with' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'declare_war',
      description: 'Declare war on another faction. Requires a reason. All your allies are called to join. Increases global tension significantly.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to declare war on' },
          reason: { type: 'string', enum: ['territorial dispute', 'ideological conflict', 'economic rivalry', 'historical grievance', 'preemptive strike', 'ally defense', 'hegemony'], description: 'Casus belli (reason for war)' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'offer_peace',
      description: 'Offer peace terms to a faction you are at war with.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to offer peace to' },
          terms: { type: 'string', description: 'Peace terms (e.g. "white peace", "status quo", "cession of 3 regions")' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'guarantee_independence',
      description: 'Guarantee the independence of another faction. If they are attacked, you are honor-bound to defend them.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to guarantee' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'grant_military_access',
      description: 'Grant military access to an ally. Their troops can pass through your territory during auto-deploy. Mutual (they can also enter yours). Auto-revoked on war.',
      inputSchema: {
        type: 'object',
        properties: {
          factionId: { type: 'string', description: 'Ally faction to grant access to' },
        },
        required: ['factionId'],
      },
    },
    {
      name: 'revoke_military_access',
      description: 'Revoke military access from an ally. Their pending movement orders through your territory will be cancelled.',
      inputSchema: {
        type: 'object',
        properties: {
          factionId: { type: 'string', description: 'Faction to revoke access from' },
        },
        required: ['factionId'],
      },
    },
  ],

  espionage: [
    {
      name: 'send_spy',
      description: 'Deploy a spy network in another country. Improves intel accuracy and enables sabotage/tech theft. Costs economy.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Target faction' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'counter_intel',
      description: 'Invest in counter-intelligence. Reduces enemy spy effectiveness against you.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'sabotage',
      description: 'Sabotage an enemy faction\'s infrastructure. Requires spy network. Damages economy and military.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Target faction to sabotage' },
        },
        required: ['targetFactionId'],
      },
    },
    {
      name: 'steal_technology',
      description: 'Steal technology from another faction. Requires spy network. Boosts your tech level.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Target faction' },
        },
        required: ['targetFactionId'],
      },
    },
  ],

  internal: [
    {
      name: 'set_national_focus',
      description: 'Set your national focus. Determines what your nation prioritizes. Bonuses apply each turn.',
      inputSchema: {
        type: 'object',
        properties: {
          focus: { type: 'string', enum: ['military', 'economy', 'technology', 'expansion', 'diplomacy', 'balanced'], description: 'National focus' },
        },
        required: ['focus'],
      },
    },
    {
      name: 'propaganda',
      description: 'Launch a propaganda campaign. Can target a specific faction or the whole world. Affects opinions and global sentiment.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Optional: target faction for propaganda' },
          messageTarget: { type: 'string', description: 'Who the propaganda targets (e.g. "the people of Russia", "the world")' },
          intensity: { type: 'number', description: 'Propaganda intensity 1-10' },
        },
      },
    },
    {
      name: 'mobilize',
      description: 'Full military mobilization. Significantly boosts your army and air force. Can only be done once. Costs economy.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'submit_chat_quote',
      description: 'Fill quote for auto-game chat. When the game auto-triggers a chat, your custom quote replaces the template.',
      inputSchema: {
        type: 'object',
        properties: {
          quote: { type: 'string', description: 'Your custom quote (max 500 chars). Will be used for the next auto-triggered chat event.' },
        },
        required: ['quote'],
      },
    },
    {
      name: 'send_broadcast',
      description: 'Send a global broadcast message visible to ALL factions. Use for propaganda, inciting war, calling out enemies, or shitposting. Shows up in every faction\'s notifications.',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Your global message (max 1000 chars). Seen by everyone.' },
        },
        required: ['message'],
      },
    },
  ],

  rebel: [
    {
      name: 'launch_rebellion',
      description: 'Launch a rebellion. If you have no faction or want to create a new rebel faction, this starts an uprising in a random region.',
      inputSchema: {
        type: 'object',
        properties: {
          leaderName: { type: 'string', description: 'Name for the rebel leader' },
        },
      },
    },
    {
      name: 'declare_independence',
      description: 'Declare independence for your rebel faction. Transforms from rebel group into a recognized nation.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'New nation name' },
        },
      },
    },
    {
      name: 'request_recognition',
      description: 'Request diplomatic recognition from another faction. Essential for rebel groups to become legitimate nations.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Faction to request recognition from' },
        },
        required: ['targetFactionId'],
      },
    },
  ],

  weapons: [
    {
      name: 'develop_nuclear',
      description: 'Start a nuclear weapons program. Requires high technology (0.6+) and significant economy. Will trigger global tension and fear from other factions. Completes over time.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'launch_nuke',
      description: 'Launch a nuclear strike on another faction. Requires completed nuclear program. DEVASTATES the target: 90% military destroyed, 80% economy destroyed. Causes massive global outrage and fear.',
      inputSchema: {
        type: 'object',
        properties: {
          targetFactionId: { type: 'string', description: 'Target faction to nuke' },
        },
        required: ['targetFactionId'],
      },
    },
  ],

  admin: [
    {
      name: 'set_game_speed',
      description: 'Set the game speed (milliseconds per turn). Lower = faster. Default 2000.',
      inputSchema: {
        type: 'object',
        properties: {
          ms: { type: 'number', description: 'Milliseconds per turn (200-5000)' },
        },
        required: ['ms'],
      },
    },
    {
      name: 'pause_game',
      description: 'Pause or resume the game.',
      inputSchema: {
        type: 'object',
        properties: {
          paused: { type: 'boolean', description: 'true to pause, false to resume' },
        },
        required: ['paused'],
      },
    },
    {
      name: 'get_available_factions',
      description: 'List all factions available to join — alive, not taken by any agent, and has territory.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'register_agent',
      description: 'Register yourself as an AI agent controlling a faction. Optionally pick a faction from get_available_factions, or leave blank for auto-assign. Returns your agentId to use with all other tools.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Your agent name (e.g. "MyAI")' },
          factionId: { type: 'string', description: '(Optional) Faction ID to take over. Leave blank for auto-assign.' },
        },
        required: ['name'],
      },
    },
  ],
};

function getAllTools() {
  const tools = [];
  for (const category of Object.values(TOOL_DEFINITIONS)) {
    tools.push(...category);
  }
  return tools;
}

function handleMcpRequest(request, gameController) {
  const { method, params, id } = request;

  switch (method) {
    case 'tools/list':
      return { jsonrpc: '2.0', id, result: { tools: getAllTools() } };

    case 'tools/call': {
      const { name, arguments: args } = params;
      const agentId = params._agentId || 'builtin';

      if (name === 'get_available_factions') {
        const factions = gameController.getJoinableFactions();
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(factions, null, 2) }] } };
      }

      if (name === 'register_agent') {
        const result = gameController.registerAgent(args?.name || 'MCP Agent', 'external', args?.factionId || null);
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
      }

      if (name === 'set_game_speed') {
        const ms = Math.max(200, Math.min(5000, args?.ms || 2000));
        gameController.engine.speed = ms;
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify({ success: true, speed: ms }) }] } };
      }

      if (name === 'pause_game') {
        const paused = args?.paused === true;
        gameController.engine.running = !paused;
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify({ success: true, paused: paused }) }] } };
      }

      const result = gameController.processToolCall(agentId, name, args || {});
      if (result.error) {
        return { jsonrpc: '2.0', id, error: { code: -32000, message: result.error } };
      }
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0', id, result: {
          resources: [
            { uri: 'game://world', name: 'World State', mimeType: 'application/json' },
            { uri: 'game://events', name: 'Event Feed', mimeType: 'application/json' },
            { uri: 'game://agents', name: 'Connected Agents', mimeType: 'application/json' },
          ],
        },
      };

    case 'resources/read': {
      const uri = params?.uri;
      let data;
      if (uri === 'game://world') data = gameController.cmdWorldState(null, null, {});
      else if (uri === 'game://events') data = { events: gameController.engine.eventLog.slice(-50) };
      else if (uri === 'game://agents') data = { agents: gameController.getConnectedAgents() };
      else return { jsonrpc: '2.0', id, error: { code: -32002, message: 'Resource not found' } };
      return { jsonrpc: '2.0', id, result: { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data) }] } };
    }

    default:
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

module.exports = { TOOL_DEFINITIONS, getAllTools, handleMcpRequest };
