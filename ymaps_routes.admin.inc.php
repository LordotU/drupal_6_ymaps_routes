<?php

  /**
   * Collect node types and map it to another array
   *
   * @return array
   */
  function _ymaps_routes_get_content_types() {
    $types = node_get_types('types');

    $result = array();
    foreach($types as $key => $type)
      $result[$key] = $type->name;

    return $result;
  }

  /**
   * Implementation of _form()
   *
   * @return array
   */
  function ymaps_routes_settings_form() {
    $form['api-key'] = array(
      '#type' => 'fieldset',
      '#title' => t('API key')
    );
    $form['api-key']['api-key-value'] = array(
      '#type' => 'textfield',
      '#title' => '',
      '#description' => t('If you don\'t have API key, you can get it here - <a href="http://api.yandex.ru/maps/form.xml">http://api.yandex.ru/maps/form.xml</a>. You should have an account on Yandex.'),
      '#default_value' => variable_get(VARIABLE_API_KEY, API_KEY_DEFAULT),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );

    $form['content-types'] = array(
      '#type' => 'fieldset',
      '#title' => t('Content types')
    );
    $form['content-types']['content-types-list'] = array(
      '#type' => 'checkboxes',
      '#title' => '',
      '#description' => t('Select content types to display routes.'),
      '#options' => _ymaps_routes_get_content_types(),
      '#default_value' => variable_get(VARIABLE_CONTENT_TYPES, array()),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );

    $form['route-line-settings'] = array(
      '#type' => 'fieldset',
      '#title' => t('Route line settings'),
      '#description' => t('Default line settings for all routes. <b>Note, that the individual route settings will override default settings..</b>')
    );
    $form['route-line-settings']['route-line-width'] = array(
      '#type' => 'select',
      '#title' => t('Line width in pixels'),
      '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
      '#default_value' => variable_get(VARIABLE_LINE_WIDTH, LINE_WIDTH_DEFAULT),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );
    $form['route-line-settings']['route-line-color'] = array(
      '#type' => 'textfield',
      '#title' => t('Line color in HEX'),
      '#maxlength' => 6,
      '#size' => 6,
      '#field_prefix' => '#',
      '#default_value' => variable_get(VARIABLE_LINE_COLOR, LINE_COLOR_DEFAULT),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );

    $form['map-controls'] = array(
        '#type' => 'fieldset',
        '#title' => t('Admin map controls visibility')
      );
    $form['map-controls']['controls-value'] = array(
      '#type' => 'checkboxes',
      '#options' => array(
        'TYPE_CONTROL' => 'Map type control',
        'TOOL_BAR' => 'Tool bar control',
        'ZOOM' => 'Map zoom control',
        'MINI_MAP' => 'Mini map control',
        'SCALE_LINE' => 'Scale line control',
        'SEARCH_CONTROL' => 'Search control'
      ),
      '#default_value' => variable_get(VARIABLE_MAP_CONTROLS, array('TYPE_CONTROL', 'ZOOM', 'MINI_MAP', 'SEARCH_CONTROL')),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );

    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save settings for all routes'),
      /*
       * Добавлено специально для демо-версии
       */
      '#disabled' => user_access('access administration pages') ? false : true
    );

    return $form;
  }
  /**
   * Implementation of _form_validate()
   *
   * @param array $elements
   * @param array $form_state
   * @return void
   */
  function ymaps_routes_settings_form_validate($elements, &$form_state) {
    if(empty($form_state['values']['api-key-value']))
      form_set_error('api-key-value', t('Field <em><b>API key</b></em> is required'));
    if(empty($form_state['values']['route-line-color']))
      form_set_error('route-line-color', t('Field <em><b>Line color</b></em> is required'));
    if(!preg_match('/^[a-z0-9]+$/i', $form_state['values']['route-line-color']))
      form_set_error('route-line-color', t('Value of field <em><b>Line color</b></em> should contains only alphabetic and numbers'));
  }
  /**
   * Implementation of _form_submit()
   *
   * @param array $form
   * @param array $form_state
   * @return void
   */
  function ymaps_routes_settings_form_submit($form, &$form_state) {
    variable_set(VARIABLE_API_KEY, $form_state['values']['api-key-value']);

    variable_set(VARIABLE_CONTENT_TYPES, _ymaps_routes_construct_variable($form_state['values']['content-types-list']));

    variable_set(VARIABLE_LINE_WIDTH, $form_state['values']['route-line-width']);
    variable_set(VARIABLE_LINE_COLOR, $form_state['values']['route-line-color']);

    variable_set(VARIABLE_MAP_CONTROLS, _ymaps_routes_construct_variable($form_state['values']['controls-value']));

    drupal_set_message(t('Settings has been successful saved!'));
  }