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
  *
  * Shows module settings start page.
  *
  */
  function ymaps_routes_admin_page() {
    return t('<p>This module is designed to create routes on Yandex.Maps and allows you to create the route, customize its appearance, and attach it to a node.</p>').
           t('<p>You can set default settings for all routes or you can specify settings (set route line color, line width and checkpoint marker) for a particular route.</p>').
           t('<p>This module creates a block which you can place, on every region of your site.</p>');
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
      '#default_value' => check_plain(variable_get(VARIABLE_API_KEY, API_KEY_DEFAULT)),
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
      '#default_value' => check_plain(variable_get(VARIABLE_LINE_COLOR, LINE_COLOR_DEFAULT)),
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
   * @param array &$form_state
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
   * @param array &$form_state
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

  /**
   * Implementation of _form()
   *
   * @return array
   */
  function ymaps_routes_markers_form() {
    $markers = _ymaps_routes_get_markers();
    if(empty($markers)) {
      drupal_set_message(t('Markers not found! Please, upload them from node edit page.'), 'error');
      drupal_goto('admin/settings/ymaps_routes/routes');
    }      

    $form['markers-token'] = array(
      '#type' => 'hidden',
      '#default_value' => drupal_get_token()
    );

    $form['routes-markers'] = array(
      '#type' => 'fieldset',
      '#title' => t('Marker library')
    );
    $form['routes-markers']['markers-list'] = array(
      '#type' => 'checkboxes',
      '#title' => '',
      '#options' => $markers,
      '#prefix' => '<div class="container-inline">',
      '#suffix' => '</div>'
    );

    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Delete selected markers')
    );

    return $form;
  }
  /**
   * Implementation of _form_validate()
   *
   * @param array $elements
   * @param array &$form_state
   * @return array
   */
  function ymaps_routes_markers_form_validate($elements, &$form_state) {
    if(!drupal_valid_token($form_state['values']['markers-token']))
      form_set_error('markers-token', t('Invalid deletion token!'));
  }
  /**
   * Implementation of _form_submit()
   *
   * @param array $form
   * @param arrat &$form_state
   * @return array
   */
  function ymaps_routes_markers_form_submit($form, &$form_state) {
    $markers = $form_state['values']['markers-list'];

    foreach ($markers as $key => $value)
      if($value) {
        $file = db_fetch_object(db_query("SELECT {files}.`filepath` FROM {files}, {ymaps_routes_markers} WHERE {files}.`fid` = {ymaps_routes_markers}.`fid` AND {ymaps_routes_markers}.`mid` = %d", $key));
        
        if(file_delete($file->filepath)) {
          db_query("DELETE FROM {ymaps_routes_markers}, {files} USING {ymaps_routes_markers}, {files} WHERE {ymaps_routes_markers}.`fid` = {files}.`fid` AND {ymaps_routes_markers}.`mid` = %d", $key);

          if(db_affected_rows()) {
            drupal_set_message(t('Selected markers were successful deleted!'));
            drupal_goto('admin/settings/ymaps_routes/markers');
          }
        }
      }
  }